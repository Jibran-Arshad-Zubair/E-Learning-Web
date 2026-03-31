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

export async function getAgentResponse(message, conversationHistory, extractedData, websiteContext) {
  const res = await fetchWithRetry(`${API_BASE}/agent/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
      extracted_data: extractedData,
      website_context: websiteContext,
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

export async function getAgentResponseWithAudio(message, conversationHistory, extractedData, websiteContext) {
  const res = await fetchWithRetry(`${API_BASE}/agent/respond-with-audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
      extracted_data: extractedData,
      website_context: websiteContext,
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
  // Counts how many stale server response cycles to discard after an abort.
  // The server is sequential: one full cycle (chunks → text → done) per message.
  // Each abort increments this; each 'done' frame decrements it.
  let skipResponses = 0;

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
    if (typeof e.data === 'string') {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'done') {
          if (skipResponses > 0) { skipResponses--; return; } // discard stale cycle
          if (!pending) return;
          await pending.chunkQueue;
          const { textData, chunks, resolve } = pending;
          pending = null;
          const audioBlob = chunks.length > 0 ? new Blob(chunks, { type: 'audio/wav' }) : undefined;
          resolve({ response: '', show_doctors: false, navigate_to: null, ...textData, audioBlob });
        } else if (msg.type === 'text') {
          if (skipResponses > 0) return; // discard stale text
          if (!pending) return;
          pending.textData = {
            response: msg.response ?? '',
            show_doctors: msg.show_doctors ?? false,
            appointment_pending: msg.appointment_pending ?? null,
            clear_data: msg.clear_data ?? false,
            navigate_to: msg.navigate_to ?? null,
          };
        } else if (msg.type === 'error') {
          if (skipResponses > 0) { skipResponses--; return; } // treat error as end of stale cycle
          if (!pending) return;
          const { reject } = pending;
          pending = null;
          reject(new Error(msg.detail || 'Agent error'));
        }
      } catch {}
    } else if (e.data instanceof Blob) {
      if (skipResponses > 0) return; // discard stale audio
      if (!pending) return;
      const blobData = e.data;
      pending.chunkQueue = pending.chunkQueue.then(async () => {
        if (!pending) return;
        const arr = new Uint8Array(await blobData.arrayBuffer());
        pending.onAudioChunk?.(arr);
        pending.chunks.push(arr);
      });
    } else if (e.data instanceof ArrayBuffer) {
      if (skipResponses > 0) return; // discard stale audio
      if (!pending) return;
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
    send: (message, conversationHistory, extractedData, onAudioChunk, websiteContext) =>
      new Promise((resolve, reject) => {
        // Abort the previous request instead of erroring — the new message takes priority
        if (pending) {
          const { reject: prevReject } = pending;
          pending = null;
          skipResponses++; // mark one stale cycle to discard
          prevReject(new Error('AbortError'));
        }
        if (ws.readyState !== WebSocket.OPEN) { reject(new Error('WebSocket not open')); return; }
        pending = { resolve, reject, chunks: [], onAudioChunk, chunkQueue: Promise.resolve() };
        try {
          const payload = {
            message,
            conversation_history: conversationHistory,
            extracted_data: extractedData,
          };
          if (websiteContext) payload.website_context = websiteContext;
          ws.send(JSON.stringify(payload));
        } catch (e) {
          pending = null;
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      }),
    abort: () => {
      if (pending) {
        const { reject } = pending;
        pending = null;
        skipResponses++;
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