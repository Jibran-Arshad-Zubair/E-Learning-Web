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
  const currentResponseRef = useRef(null);

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

  // Helper function to play audio with proper loading
  const playAudioBlob = useCallback(async (audioBlob) => {
    if (!audioBlob || audioBlob.size === 0) {
      console.error('Empty audio blob received');
      return;
    }

    console.log('Playing audio blob:', audioBlob.size, 'bytes', 'type:', audioBlob.type);

    // Create URL for the blob
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Set up event listeners
    const onCanPlayThrough = () => {
      console.log('Audio can play through, duration:', audio.duration);
    };
    
    const onPlay = () => {
      console.log('Audio playback started');
    };
    
    const onEnded = () => {
      console.log('Audio playback ended');
      URL.revokeObjectURL(audioUrl);
      
      // Play next in queue
      if (audioQueueRef.current.length > 0) {
        const nextAudio = audioQueueRef.current.shift();
        nextAudio.play().catch(err => {
          console.error('Error playing next audio:', err);
        });
      } else {
        isPlayingRef.current = false;
        currentAudioRef.current = null;
      }
    };
    
    const onError = (e) => {
      console.error('Audio playback error:', e);
      URL.revokeObjectURL(audioUrl);
      
      // Try next in queue
      if (audioQueueRef.current.length > 0) {
        const nextAudio = audioQueueRef.current.shift();
        nextAudio.play().catch(err => {
          console.error('Error playing next audio:', err);
        });
      } else {
        isPlayingRef.current = false;
        currentAudioRef.current = null;
      }
    };
    
    audio.addEventListener('canplaythrough', onCanPlayThrough);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    
    // Store current audio reference
    currentAudioRef.current = audio;
    currentResponseRef.current = audio;
    
    // Add to queue
    audioQueueRef.current.push(audio);
    
    // If not playing, start playing
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      
      const playNext = () => {
        if (audioQueueRef.current.length === 0) {
          isPlayingRef.current = false;
          currentAudioRef.current = null;
          return;
        }
        
        const nextAudio = audioQueueRef.current.shift();
        nextAudio.play().catch(err => {
          console.error('Error playing audio:', err);
          // If error, move to next
          playNext();
        });
      };
      
      playNext();
    }
  }, []);

  // Stop current audio playback
  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        if (currentAudioRef.current.src) {
          URL.revokeObjectURL(currentAudioRef.current.src);
        }
      } catch (err) {
        console.error('Error stopping audio:', err);
      }
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

      console.log('Sending message:', message);

      // Send to WebSocket
      const result = await wsRef.current.send(
        message,
        updatedHistory,
        extractedData,
        (chunk) => {
          // Optional: handle audio chunks if needed
          if (onAudioChunk) onAudioChunk(chunk);
        }
      );

      console.log('Received result:', {
        hasResponse: !!result.response,
        responseLength: result.response?.length,
        hasAudio: !!result.audioBlob,
        audioSize: result.audioBlob?.size,
        showDoctors: result.show_doctors
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