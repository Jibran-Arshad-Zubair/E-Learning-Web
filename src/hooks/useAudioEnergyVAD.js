'use client'

import { useState, useRef, useCallback, useEffect } from 'react';

// ---------------------------------------------------------------------------
// RMS energy floor for human speech.
// When echoCancellation:true is requested via getUserMedia, the browser asks
// the OS/hardware AEC to subtract whatever is currently playing through the
// speakers from the mic input.  TTS echo residual after AEC is typically well
// below 0.015; normal conversational speech registers 0.03–0.15.
// ---------------------------------------------------------------------------
const RMS_THRESHOLD = 0.018;

// How many consecutive rAF frames (~60 fps) must be above the threshold before
// we treat it as "real speech".  6 frames ≈ 100 ms — long enough to ignore
// transient pops / clicks from the speakers, short enough to feel instant.
const SUSTAINED_FRAMES = 6;

export function useAudioEnergyVAD() {
  const [isVADActive, setIsVADActive] = useState(false);

  const streamRef     = useRef(null);
  const audioCtxRef   = useRef(null);
  const rafRef        = useRef(null);
  const isActiveRef   = useRef(false);
  const frameCountRef = useRef(0);
  const callbackRef   = useRef(null);

  const stopVAD = useCallback(() => {
    isActiveRef.current = false;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    frameCountRef.current = 0;
    setIsVADActive(false);
  }, []);

  const startVAD = useCallback(async (onSpeechDetected) => {
    // Always tear down any prior session before starting a new one
    stopVAD();

    callbackRef.current = onSpeechDetected;
    isActiveRef.current = true;
    setIsVADActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,   // ← key: OS/hardware AEC subtracts TTS output
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // stopVAD may have been called while getUserMedia was resolving
      if (!isActiveRef.current) {
        stream.getTracks().forEach(t => t.stop());
        setIsVADActive(false);
        return;
      }

      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize               = 256;   // 128 frequency bins — fast & cheap
      analyser.smoothingTimeConstant = 0.25;
      source.connect(analyser);

      const buf = new Float32Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!isActiveRef.current) return;

        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);

        if (rms > RMS_THRESHOLD) {
          frameCountRef.current += 1;
          if (frameCountRef.current >= SUSTAINED_FRAMES) {
            // Confirmed sustained speech energy — fire once, reset counter
            frameCountRef.current = 0;
            callbackRef.current?.();
          }
        } else {
          // Gentle decay so a brief silence gap mid-word doesn't reset the window
          frameCountRef.current = Math.max(0, frameCountRef.current - 1);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error('[VAD] getUserMedia failed:', err);
      isActiveRef.current = false;
      setIsVADActive(false);
    }
  }, [stopVAD]);

  // Cleanup on unmount
  useEffect(() => () => stopVAD(), [stopVAD]);

  return { startVAD, stopVAD, isVADActive };
}
