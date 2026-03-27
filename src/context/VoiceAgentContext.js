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

    // Handle page visibility change (reconnect when tab becomes active)
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

  // Audio playback helper
  const playAudioBlob = useCallback(async (audioBlob) => {
    if (!audioBlob) return;

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;

    // Add to queue
    audioQueueRef.current.push(audio);

    // If not playing, start playing
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      
      const playNext = () => {
        if (audioQueueRef.current.length === 0) {
          isPlayingRef.current = false;
          return;
        }
        
        const nextAudio = audioQueueRef.current.shift();
        nextAudio.play();
        nextAudio.onended = () => {
          URL.revokeObjectURL(nextAudio.src);
          playNext();
        };
        nextAudio.onerror = () => {
          URL.revokeObjectURL(nextAudio.src);
          playNext();
        };
      };
      
      playNext();
    }
  }, []);

  // Stop current audio playback
  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  // Send message to agent
  const sendMessage = useCallback(async (message, onAudioChunk = null) => {
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

      // Send to WebSocket
      const result = await wsRef.current.send(
        message,
        updatedHistory,
        extractedData,
        onAudioChunk
      );

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
      if (result.audioBlob) {
        await playAudioBlob(result.audioBlob);
      }

      setIsProcessing(false);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to get agent response');
      setIsProcessing(false);
      console.error('Send message error:', err);
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