"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceAgent } from "../../context/VoiceAgentContext";

// ─── Wave constants ───────────────────────────────────────────────────────────

const FILLS = {
  idle: [
    "rgba(139,92,246,0.10)",
    "rgba(99,102,241,0.07)",
    "rgba(167,139,250,0.05)",
  ],
  processing: [
    "rgba(251,146,60,0.15)",
    "rgba(249,115,22,0.10)",
    "rgba(254,215,170,0.07)",
  ],
  speaking: [
    "rgba(16,185,129,0.17)",
    "rgba(52,211,153,0.11)",
    "rgba(110,231,183,0.07)",
  ],
};

const PATHS = [
  "M0,80 C360,25 1080,135 1440,80 C1800,25 2520,135 2880,80 L2880,160 L0,160 Z",
  "M0,80 C360,135 1080,25 1440,80 C1800,135 2520,25 2880,80 L2880,160 L0,160 Z",
  "M0,100 C360,55 1080,145 1440,95 C1800,50 2520,140 2880,100 L2880,160 L0,160 Z",
];

const WAVE_ANIMS = [
  { name: "wave-slide-fwd", baseDuration: 14 },
  { name: "wave-slide-rev", baseDuration: 10 },
  { name: "wave-slide-mid", baseDuration: 7 },
];

// ─── Subtitle helpers ─────────────────────────────────────────────────────────

// Average speaking rate ~150 wpm ≈ 13 chars/sec
const CHARS_PER_SEC = 13;
const MAX_LINE_CHARS = 68;
const MIN_LINE_MS = 900;

/**
 * Split a response string into subtitle lines.
 * First splits at sentence boundaries, then wraps long sentences at word edges.
 */
function splitIntoLines(text) {
  if (!text) return [];

  // Normalise sentence breaks into \n
  const raw = text.replace(/([.!?])\s+/g, "$1\n").split("\n");

  const lines = [];
  for (const sentence of raw) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length <= MAX_LINE_CHARS) {
      lines.push(trimmed);
      continue;
    }

    // Wrap long sentence at word boundaries
    const words = trimmed.split(" ");
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > MAX_LINE_CHARS && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }

  return lines.filter(Boolean);
}

function estimateLineDuration(line) {
  return Math.max(MIN_LINE_MS, (line.length / CHARS_PER_SEC) * 1000);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WaveOverlay() {
  const { isPlayingAudio, isProcessing, currentAgentSpeech } = useVoiceAgent();

  const [lines, setLines] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const lineTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  // Recursively schedule line advances
  const scheduleAdvance = useCallback((linesArr, index) => {
    clearTimeout(lineTimerRef.current);
    if (index >= linesArr.length - 1) return; // already on last line
    const ms = estimateLineDuration(linesArr[index]);
    lineTimerRef.current = setTimeout(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        scheduleAdvance(linesArr, next);
        return next;
      });
    }, ms);
  }, []);

  useEffect(() => {
    if (isPlayingAudio && currentAgentSpeech) {
      clearTimeout(lineTimerRef.current);
      clearTimeout(hideTimerRef.current);

      const newLines = splitIntoLines(currentAgentSpeech);
      setLines(newLines);
      setActiveIndex(0);
      setVisible(true);
      scheduleAdvance(newLines, 0);
    } else if (!isPlayingAudio) {
      clearTimeout(lineTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        // Reset after exit animation finishes
        setTimeout(() => {
          setLines([]);
          setActiveIndex(0);
        }, 450);
      }, 700);
    }

    return () => {
      clearTimeout(lineTimerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, [isPlayingAudio, currentAgentSpeech, scheduleAdvance]);

  const state = isPlayingAudio ? "speaking" : isProcessing ? "processing" : "idle";
  const fills = FILLS[state];
  const speedFactor = isPlayingAudio ? 0.55 : isProcessing ? 0.75 : 1;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        pointerEvents: "none",
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {/* ── Animated SVG waves ── */}
      {PATHS.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 2880 160"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "200%",
            height: "100%",
            animation: `${WAVE_ANIMS[i].name} ${
              WAVE_ANIMS[i].baseDuration * speedFactor
            }s linear infinite`,
          }}
        >
          <path
            d={d}
            style={{ fill: fills[i], transition: "fill 1.2s ease" }}
          />
        </svg>
      ))}

      {/* ── Subtitle panel — flexbox-centered, no transform conflict ── */}
      <div
        style={{
          position: "absolute",
          bottom: 54,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
        }}
      >
        <AnimatePresence>
          {visible && lines.length > 0 && (
            <motion.div
              key="subtitle-panel"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                width: "min(640px, calc(100vw - 120px))",
                padding: "10px 24px 12px",
                background: "rgba(8,8,12,0.78)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                borderRadius: 20,
                border: "1px solid rgba(139,92,246,0.28)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              {/*
               * Render a 3-line window: [prev, active, next].
               * Each offset is animated independently so Framer Motion
               * tracks them by their stable `lineIndex` key.
               */}
              <AnimatePresence mode="popLayout">
                {[-1, 0, 1].map((offset) => {
                  const lineIndex = activeIndex + offset;
                  if (lineIndex < 0 || lineIndex >= lines.length) return null;

                  const isActive = offset === 0;
                  const isPrev   = offset === -1;

                  return (
                    <motion.p
                      key={lineIndex}
                      layout="position"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: isActive ? 1 : isPrev ? 0.25 : 0.42,
                        y: 0,
                        scale: isActive ? 1 : 0.94,
                      }}
                      exit={{ opacity: 0, y: -10, scale: 0.92 }}
                      transition={{
                        duration: 0.38,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        layout: { duration: 0.32 },
                      }}
                      style={{
                        margin: 0,
                        width: "100%",
                        fontSize: isActive ? 14 : 12,
                        fontFamily: "var(--font-inter, sans-serif)",
                        lineHeight: 1.55,
                        textAlign: "center",
                        fontWeight: isActive ? 500 : 400,
                        letterSpacing: isActive ? "0.012em" : "0",
                        color: isActive
                          ? "rgba(255,255,255,0.95)"
                          : "rgba(255,255,255,0.55)",
                        textShadow: isActive
                          ? "0 0 22px rgba(139,92,246,0.55)"
                          : "none",
                        transformOrigin: "center top",
                      }}
                    >
                      {lines[lineIndex]}
                    </motion.p>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
