// src/context/VoiceAgentContext.js
'use client'

import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { createAgentWebSocket } from '../../lib/api';

const VoiceAgentContext = createContext();

export function VoiceAgentProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [extractedData, setExtractedData] = useState({});
  const [appointmentData, setAppointmentData] = useState(null);
  const [showDoctors, setShowDoctors] = useState(false);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (wsRef.current?.isOpen()) {
      return;
    }

    const ws = createAgentWebSocket();
    wsRef.current = ws;

    ws.ready().then(() => {
      setIsConnected(true);
      setError(null);
      console.log('WebSocket connected');
    }).catch((err) => {
      setError('Failed to connect to voice agent');
      console.error('WebSocket connection error:', err);
    });
  }, []);

  // Auto-connect on mount and handle reconnection
  useEffect(() => {
    initializeWebSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!wsRef.current || !wsRef.current.isOpen())) {
        initializeWebSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeWebSocket]);

  // Helper function to play audio using AudioContext to handle concatenated WAV chunks
  const playAudioBlob = useCallback(async (audioBlob) => {
    if (!audioBlob || audioBlob.size === 0) {
      console.error('Empty audio blob received');
      return;
    }

    console.log('Playing audio blob:', audioBlob.size, 'bytes');

    // Close any existing audio context before starting a new one
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();
    audioContextRef.current = audioContext;

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      // Find all WAV segment boundaries by scanning for RIFF headers.
      // Streaming backends send multiple complete WAV chunks; naively concatenating
      // them causes the decoder to stop at the first header's data-size field,
      // which is why only the first 2-3 words play.
      const riff = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
      const starts = [0];
      for (let i = 4; i < uint8.length - 3; i++) {
        if (uint8[i] === riff[0] && uint8[i+1] === riff[1] &&
            uint8[i+2] === riff[2] && uint8[i+3] === riff[3]) {
          starts.push(i);
        }
      }

      // Decode each WAV segment independently
      const buffers = await Promise.all(
        starts.map((start, idx) => {
          const end = starts[idx + 1] ?? uint8.length;
          return audioContext.decodeAudioData(arrayBuffer.slice(start, end));
        })
      );

      // Merge all decoded AudioBuffers into one continuous buffer
      const channels = buffers[0].numberOfChannels;
      const sampleRate = buffers[0].sampleRate;
      const totalLength = buffers.reduce((n, b) => n + b.length, 0);
      const merged = audioContext.createBuffer(channels, totalLength, sampleRate);

      let offset = 0;
      for (const buf of buffers) {
        for (let ch = 0; ch < channels; ch++) {
          merged.getChannelData(ch).set(buf.getChannelData(ch), offset);
        }
        offset += buf.length;
      }

      const source = audioContext.createBufferSource();
      source.buffer = merged;
      source.connect(audioContext.destination);

      isPlayingRef.current = true;
      currentAudioRef.current = source;

      return new Promise((resolve) => {
        source.onended = () => {
          isPlayingRef.current = false;
          currentAudioRef.current = null;
          audioContextRef.current = null;
          audioContext.close().catch(() => {});
          resolve();
        };
        source.start(0);
      });
    } catch (err) {
      console.error('Audio playback error:', err);
      isPlayingRef.current = false;
      currentAudioRef.current = null;
      audioContextRef.current = null;
      audioContext.close().catch(() => {});
    }
  }, []);

  // Stop current audio playback
  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.stop(); // AudioBufferSourceNode.stop()
      } catch (_) {}
      currentAudioRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  // Send message to agent
  const sendMessage = useCallback(async (message, websiteContext = null, onAudioChunk = null) => {
    if (!wsRef.current || !wsRef.current.isOpen()) {
      setError('WebSocket not connected');
      initializeWebSocket();
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Add user message to history
      const updatedHistory = [...conversationHistory, { role: 'user', content: message }];
      setConversationHistory(updatedHistory);

      console.log('Sending message:', message);
      if (websiteContext) {
        console.log('With website context:', typeof websiteContext === 'string' ? websiteContext.substring(0, 200) : JSON.stringify(websiteContext).substring(0, 200));
      }

      // Send to WebSocket with website context
      const result = await wsRef.current.send(
        message,
        updatedHistory,
        extractedData,
        onAudioChunk,
        websiteContext
      );

      console.log('Received result:', {
        hasResponse: !!result.response,
        responseLength: result.response?.length,
        hasAudio: !!result.audioBlob,
        audioSize: result.audioBlob?.size
      });

      // Handle response
      if (result.response) {
        setConversationHistory(prev => [...prev, { role: 'assistant', content: result.response }]);
      }

      if (result.show_doctors) {
        setShowDoctors(true);
      }

      if (result.appointment_pending) {
        setAppointmentData(result.appointment_pending);
      }

      if (result.clear_data) {
        setExtractedData({});
      }

      // Play audio if available
      if (result.audioBlob && result.audioBlob.size > 0) {
        console.log('Playing audio response...');
        await playAudioBlob(result.audioBlob);
      } else {
        console.warn('No audio blob received or empty audio');
      }

      setIsProcessing(false);
      return result;
    } catch (err) {
      console.error('Send message error:', err);
      setError(err.message || 'Failed to get agent response');
      setIsProcessing(false);
      return null;
    }
  }, [conversationHistory, extractedData, initializeWebSocket, playAudioBlob]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    setConversationHistory([]);
    setExtractedData({});
    setAppointmentData(null);
    setShowDoctors(false);
    stopAudio();
  }, [stopAudio]);

  // Update extracted data
  const updateExtractedData = useCallback((data) => {
    setExtractedData(prev => ({ ...prev, ...data }));
  }, []);

  const value = {
    isConnected,
    isProcessing,
    conversationHistory,
    extractedData,
    appointmentData,
    showDoctors,
    error,
    sendMessage,
    resetConversation,
    updateExtractedData,
    stopAudio,
    setShowDoctors,
  };

  return (
    <VoiceAgentContext.Provider value={value}>
      {children}
    </VoiceAgentContext.Provider>
  );
}

export function useVoiceAgent() {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error('useVoiceAgent must be used within VoiceAgentProvider');
  }
  return context;
}