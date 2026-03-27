// src/lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  let lastError = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || (res.status >= 400 && res.status < 500)) return res;
      if (i < retries) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
      lastError = new Error(`Request failed: ${res.status}`);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (i < retries) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
    }
  }
  throw lastError;
}

export async function getAgentResponse(message, conversationHistory, extractedData) {
  const res = await fetchWithRetry(`${API_BASE}/agent/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
      extracted_data: extractedData,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to get agent response');
  }
  const data = await res.json();
  return {
    response: data.response,
    show_doctors: data.show_doctors ?? false,
    appointment_created: data.appointment_created ?? undefined,
    appointment_pending: data.appointment_pending ?? undefined,
    audio_base64: data.audio_base64,
  };
}

export async function getAgentResponseWithAudio(message, conversationHistory, extractedData) {
  const res = await fetchWithRetry(`${API_BASE}/agent/respond-with-audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
      extracted_data: extractedData,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to get agent response');
  }
  const data = await res.json();
  return {
    response: data.response,
    show_doctors: data.show_doctors ?? false,
    appointment_created: data.appointment_created ?? undefined,
    appointment_pending: data.appointment_pending ?? undefined,
    audio_base64: data.audio_base64,
  };
}

export async function createAppointment(apt) {
  const res = await fetchWithRetry(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apt),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create appointment');
  }
  return res.json();
}

export async function fetchDoctors() {
  const res = await fetch(`${API_BASE}/doctors`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

export async function synthesizeSpeech(text) {
  const res = await fetchWithRetry(`${API_BASE}/speech/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to synthesize speech');
  }
  return res.blob();
}

/**
 * WebSocket agent client - persistent connection, gets text + audio in one round-trip
 */
export function createAgentWebSocket() {
  const wsUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/^http/, 'ws') + '/ws/agent';
  const ws = new WebSocket(wsUrl);

  let resolveReady = null;
  const readyPromise = new Promise((r) => { resolveReady = r; });

  let pending = null;

  ws.onopen = () => resolveReady?.();
  ws.onerror = () => {
    pending?.reject(new Error('WebSocket error'));
    pending = null;
  };
  ws.onclose = () => {
    pending?.reject(new Error('WebSocket closed'));
    pending = null;
  };
  ws.onmessage = async (e) => {
    if (!pending) return;
    if (typeof e.data === 'string') {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'text') {
          pending.textData = {
            response: msg.response ?? '',
            show_doctors: msg.show_doctors ?? false,
            appointment_pending: msg.appointment_pending ?? undefined,
            clear_data: msg.clear_data ?? false,
          };
        } else if (msg.type === 'done') {
          await pending.chunkQueue;
          const { textData, chunks, resolve } = pending;
          pending = null;
          const audioBlob = chunks.length > 0 ? new Blob(chunks.map(chunk => new Uint8Array(chunk).buffer), { type: 'audio/wav' }) : undefined;
          resolve({ response: '', show_doctors: false, ...textData, audioBlob });
        } else if (msg.type === 'error') {
          const { reject } = pending;
          pending = null;
          reject(new Error(msg.detail || 'Agent error'));
        }
      } catch {}
    } else if (e.data instanceof Blob) {
      const blobData = e.data;
      pending.chunkQueue = pending.chunkQueue.then(async () => {
        if (!pending) return;
        const arr = new Uint8Array(await blobData.arrayBuffer());
        pending.onAudioChunk?.(arr);
        pending.chunks.push(arr);
      });
    } else if (e.data instanceof ArrayBuffer) {
      const arr = new Uint8Array(e.data);
      pending.chunkQueue = pending.chunkQueue.then(() => {
        if (!pending) return;
        pending.onAudioChunk?.(arr);
        pending.chunks.push(arr);
      });
    }
  };

  return {
    ready: () => readyPromise,
    isOpen: () => ws.readyState === WebSocket.OPEN,
    send: (message, conversationHistory, extractedData, onAudioChunk) =>
      new Promise((resolve, reject) => {
        if (pending) { reject(new Error('Previous request pending')); return; }
        if (ws.readyState !== WebSocket.OPEN) { reject(new Error('WebSocket not open')); return; }
        pending = { resolve, reject, chunks: [], onAudioChunk, chunkQueue: Promise.resolve() };
        try {
          ws.send(JSON.stringify({ message, conversation_history: conversationHistory, extracted_data: extractedData }));
        } catch (e) {
          pending = null;
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      }),
    abort: () => {
      if (pending) {
        const { reject } = pending;
        pending = null;
        reject(new Error('AbortError'));
      }
    },
    close: () => ws.close(),
  };
}

/**
 * WebSocket TTS client - persistent connection for faster streaming
 */
export function createSpeechWebSocket() {
  const wsUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/^http/, 'ws') + '/ws/speech';
  const ws = new WebSocket(wsUrl);
  let resolveReady = null;
  const readyPromise = new Promise((r) => { resolveReady = r; });
  let resolvePending = null;
  const chunks = [];

  ws.onopen = () => resolveReady?.();
  ws.onerror = () => {
    resolvePending?.reject(new Error('WebSocket error'));
    resolvePending = null;
  };
  ws.onclose = () => {
    const p = resolvePending;
    resolvePending = null;
    p?.reject(new Error('WebSocket closed'));
  };
  ws.onmessage = async (e) => {
    if (typeof e.data === 'string') {
      if (e.data === 'done') {
        const blob = new Blob(chunks.map(chunk => new Uint8Array(chunk).buffer), { type: 'audio/wav' });
        chunks.length = 0;
        resolvePending?.resolve(blob);
        resolvePending = null;
      } else {
        try {
          const j = JSON.parse(e.data);
          if (j.error) {
            resolvePending?.reject(new Error(j.error));
            resolvePending = null;
          }
        } catch {}
      }
    } else if (e.data instanceof Blob) {
      chunks.push(new Uint8Array(await e.data.arrayBuffer()));
    } else if (e.data instanceof ArrayBuffer) {
      chunks.push(new Uint8Array(e.data));
    }
  };

  return {
    ready: () => readyPromise,
    synthesize: (text) =>
      new Promise((resolve, reject) => {
        if (resolvePending) { reject(new Error('Previous request pending')); return; }
        if (ws.readyState !== WebSocket.OPEN) { reject(new Error('WebSocket not open')); return; }
        resolvePending = { resolve, reject };
        chunks.length = 0;
        try {
          ws.send(JSON.stringify({ text }));
        } catch (e) {
          resolvePending = null;
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      }),
    close: () => ws.close(),
  };
}

/**
 * Transcribe audio to text using backend API
 * @param {string} audioBase64 - Base64 encoded audio data
 * @param {string} mediaFormat - Format of the audio (webm, wav, etc.)
 * @returns {Promise<string>} - Transcribed text
 */
export async function transcribeAudio(audioBase64, mediaFormat = 'webm') {
  try {
    const response = await fetchWithRetry(`${API_BASE}/voice/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_base64: audioBase64,
        media_format: mediaFormat,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Transcription failed: ${response.status}`);
    }

    const data = await response.json();
    return data.transcript || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(error.message || 'Failed to transcribe audio');
  }
}

/**
 * Alternative: Send audio blob directly to backend
 * @param {Blob} audioBlob - Audio blob from recorder
 * @returns {Promise<string>} - Transcribed text
 */
export async function transcribeAudioBlob(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await fetchWithRetry(`${API_BASE}/voice/transcribe-file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Transcription failed: ${response.status}`);
    }

    const data = await response.json();
    return data.transcript || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(error.message || 'Failed to transcribe audio');
  }
}

/**
 * Convert blob to base64 for API calls
 * @param {Blob} blob - Audio blob
 * @returns {Promise<string>} - Base64 string
 */
export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}