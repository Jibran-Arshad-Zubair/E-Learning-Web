'use client'

import { useState, useCallback, useRef, useEffect } from 'react';

// Returns true when the recognised transcript is likely an echo of the agent's
// own TTS output leaking from the speakers back into the microphone.
// Only fires during audio playback (agentText is only passed then), so it never
// suppresses real user utterances outside that window.
//
// Strategy: normalise both strings, then check whether any 3-word consecutive
// phrase from the transcript appears verbatim in the agent text.  A 3-word
// sequence is specific enough to be statistically unlikely in real user speech
// yet robust to minor ASR transcription noise.
function isLikelyEcho(transcript, agentText) {
  if (!agentText || !transcript) return false;
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const t = normalize(transcript);
  const a = normalize(agentText);
  if (t.length < 5) return false;
  // Exact substring match (common for clear speaker output)
  if (a.includes(t)) return true;
  // 3-word sliding-window match (handles slight ASR drift)
  const tWords = t.split(/\s+/);
  if (tWords.length >= 3) {
    for (let i = 0; i <= tWords.length - 3; i++) {
      const phrase = tWords.slice(i, i + 3).join(' ');
      if (a.includes(phrase)) return true;
    }
  }
  return false;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null); // null = unknown, true = granted, false = denied
  
  const recognitionRef = useRef(null);
  const isStoppingRef = useRef(false);

  // Check microphone permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Check if browser supports navigator.permissions
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          setHasPermission(permissionStatus.state === 'granted');
          
          // Listen for permission changes
          permissionStatus.onchange = () => {
            setHasPermission(permissionStatus.state === 'granted');
          };
        } else {
          // Fallback for browsers that don't support permissions API
          setHasPermission(null);
        }
      } catch (err) {
        console.error('Error checking microphone permission:', err);
        setHasPermission(null);
      }
    };
    
    checkPermission();

    // Cleanup function for when component unmounts
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.error('Error aborting recognition:', err);
        }
      }
    };
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop all tracks immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Microphone permission error:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access to use voice features.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone to use voice features.');
      } else {
        setError('Could not access microphone. Please check your microphone settings.');
      }
      
      return false;
    }
  }, []);

  const startListening = useCallback(async (onSpeechStart, agentText = '') => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support speech recognition. Please type your message instead.');
      return;
    }

    // Check permission first
    if (hasPermission === false) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    } else if (hasPermission === null) {
      // If permission status unknown, try to request
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    // Create recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
    };

    // onspeechstart fires on any audio energy including background noise, so it
    // is not used. Instead, onSpeechStart is called from the first onresult event,
    // which only fires when the engine has actually recognised words.
    let speechStartFired = false;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;

      // If this looks like the agent's own TTS leaking from the speakers back
      // into the mic, abort silently.  This check only has teeth when agentText
      // is supplied (i.e. during audio playback) — it is a no-op for all other
      // listening sessions.
      if (agentText && isLikelyEcho(transcriptText, agentText)) {
        recognition.abort();
        return;
      }

      // Fire the callback on the very first recognised word (interim results are
      // enabled, so this fires as early as possible while still requiring real speech).
      if (!speechStartFired) {
        speechStartFired = true;
        onSpeechStart?.();
      }

      setTranscript(transcriptText);

      // If final result, auto-stop
      if (event.results[current].isFinal) {
        setIsListening(false);
        recognition.stop();
      }
    };
    
    recognition.onerror = (event) => {
      // Silently ignore non-errors: intentional abort or no speech detected
      if (event.error === 'aborted' || event.error === 'no-speech') {
        setError(null);
        setIsListening(false);
        return;
      }

      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Failed to recognize speech';
      
      switch(event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          setHasPermission(false);
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please connect a microphone.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  }, [hasPermission, requestPermission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      isStoppingRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
      // Reset the flag after a brief delay
      setTimeout(() => {
        isStoppingRef.current = false;
      }, 100);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    hasPermission,
    requestPermission,
    startListening,
    stopListening,
    resetTranscript,
  };
}