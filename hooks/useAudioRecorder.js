// Updated useAudioRecorder hook with better audio quality settings
'use client'

import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const durationIntervalRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      audioChunksRef.current = [];
      setRecordingDuration(0);
      
      // Request microphone access with better quality settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100, // Better quality
          channelCount: 1, // Mono is fine for speech
        } 
      });
      
      streamRef.current = stream;
      
      // Try different MIME types for better compatibility
      let mimeType = '';
      const supportedTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      if (!mimeType) {
        throw new Error('No supported audio MIME type found');
      }
      
      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000 // Better quality
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Audio chunk received:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const mimeType = mediaRecorder.mimeType;
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log('Recording complete:', audioBlob.size, 'bytes');
          setAudioBlob(audioBlob);
        } else {
          setError('No audio data recorded');
        }
        
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
      };
      
      // Record in smaller chunks for better streaming
      mediaRecorder.start(1000);
      setIsRecording(true);
      
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      let errorMessage = 'Failed to access microphone';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access to use voice input.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone to use voice input.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Microphone is already in use by another application.';
      } else {
        errorMessage = err.message || 'Failed to start recording';
      }
      
      setError(errorMessage);
      console.error('Recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);
  }, [isRecording, stopRecording]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);
    setError(null);
  }, []);

  const getAudioBase64 = useCallback(async () => {
    if (!audioBlob) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }, [audioBlob]);

  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    audioBlob,
    error,
    recordingDuration: formatDuration(recordingDuration),
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
    getAudioBase64,
  };
}