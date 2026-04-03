'use client'

import { useState, useRef, useCallback, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Three-layer gate — ALL three must pass before stopAudio() is called.
//
// Layer 1 — RMS energy floor
//   Minimum signal level required before any further checks run.
//   TTS echo residual after echoCancellation is typically < 0.015.
//   Normal conversational speech registers 0.03–0.15.
//   Raised from 0.018 → 0.022 to filter quiet ambient noise.
//
// Layer 2 — Spectral concentration (voiced-speech band)
//   Human vowels and consonants concentrate energy in 300–3 400 Hz.
//   Coughs, sneezes, and broadband noise spread energy across the full
//   spectrum. A cough typically scores 0.20–0.38; voiced speech scores
//   0.45–0.80. Only frames above VOICED_RATIO_MIN count toward the
//   sustained counter — everything else gently decays.
//
// Layer 3 — Sustained duration
//   How many consecutive rAF ticks (~60 fps) must pass layers 1 & 2
//   before the callback fires.
//   Old value:  6 frames ≈  100 ms  → a sharp cough easily triggers this.
//   New value: 15 frames ≈  250 ms  → filters most cough/sneeze bursts
//   while still feeling instant to the user (a 250 ms delay is imperceptible
//   in natural conversation).
// ---------------------------------------------------------------------------
const RMS_THRESHOLD    = 0.022;   // energy floor (raised from 0.018)
const VOICED_RATIO_MIN = 0.42;    // min speech-band energy fraction
const SUSTAINED_FRAMES = 15;      // ~250 ms at 60 fps (raised from 6/~100 ms)

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
          echoCancellation: true,   // OS/hardware AEC subtracts TTS output from mic
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
      analyser.fftSize               = 256;   // 128 bins — fast & cheap
      analyser.smoothingTimeConstant = 0.25;
      source.connect(analyser);

      const binCount = analyser.frequencyBinCount; // 128
      const timeBuf  = new Float32Array(binCount);  // time-domain (RMS)
      const freqBuf  = new Uint8Array(binCount);    // frequency-domain (spectral check)

      // Pre-compute speech-band bin range from the actual AudioContext sample rate.
      // Different devices report 44100 Hz or 48000 Hz; computing at runtime ensures
      // the speech window is always correct regardless of hardware.
      //   binHz  = sampleRate / fftSize  (Hz per bin)
      //   sMin   = bin index for 300 Hz
      //   sMax   = bin index for 3 400 Hz
      const binHz = ctx.sampleRate / analyser.fftSize;
      const sMin  = Math.max(1, Math.round(300  / binHz));
      const sMax  = Math.min(binCount - 1, Math.round(3400 / binHz));

      const tick = () => {
        if (!isActiveRef.current) return;

        // ── Layer 1: RMS energy (time domain) ────────────────────────────
        analyser.getFloatTimeDomainData(timeBuf);
        let sum = 0;
        for (let i = 0; i < binCount; i++) sum += timeBuf[i] * timeBuf[i];
        const rms = Math.sqrt(sum / binCount);

        if (rms > RMS_THRESHOLD) {
          // ── Layer 2: Spectral concentration (frequency domain) ──────────
          // getByteFrequencyData fills freqBuf with 0-255 magnitude per bin.
          // We compare the energy sum in the speech band (sMin…sMax) against
          // the total energy across all bins.  Broadband noise (coughs,
          // sneezes, rustling) distributes energy evenly → low voiced ratio.
          // Voiced speech concentrates energy below 3.4 kHz → high ratio.
          analyser.getByteFrequencyData(freqBuf);
          let totalEnergy = 0;
          let speechEnergy = 0;
          for (let i = 0; i < binCount; i++) {
            totalEnergy += freqBuf[i];
            if (i >= sMin && i <= sMax) speechEnergy += freqBuf[i];
          }
          const voicedRatio = totalEnergy > 0 ? speechEnergy / totalEnergy : 0;

          if (voicedRatio >= VOICED_RATIO_MIN) {
            // ── Layer 3: Sustained confirmation ──────────────────────────
            // Both energy and spectral checks passed — count this frame.
            frameCountRef.current += 1;
            if (frameCountRef.current >= SUSTAINED_FRAMES) {
              // Confirmed real speech — fire once then reset counter.
              frameCountRef.current = 0;
              callbackRef.current?.();
            }
          } else {
            // Energy above floor but spectral check failed (broadband noise).
            // Gentle decay so a single clear frame doesn't reset progress.
            frameCountRef.current = Math.max(0, frameCountRef.current - 1);
          }
        } else {
          // Below energy floor — gentle decay.
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
