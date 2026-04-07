"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceAgent } from "../../context/VoiceAgentContext";

// Wave fill colors per agent state
const FILLS = {
  idle: [
    "rgba(139,92,246,0.10)",  // purple-500
    "rgba(99,102,241,0.07)",  // indigo-500
    "rgba(167,139,250,0.05)", // violet-400
  ],
  processing: [
    "rgba(251,146,60,0.15)",  // orange-400
    "rgba(249,115,22,0.10)",  // orange-500
    "rgba(254,215,170,0.07)", // orange-200
  ],
  speaking: [
    "rgba(16,185,129,0.17)",  // emerald-500
    "rgba(52,211,153,0.11)",  // emerald-400
    "rgba(110,231,183,0.07)", // emerald-300
  ],
};

// SVG paths — two full periods each (period=1440) so -50% translateX loops seamlessly
const PATHS = [
  // Wave 1: gentle swell, starts at mid-height
  "M0,80 C360,25 1080,135 1440,80 C1800,25 2520,135 2880,80 L2880,160 L0,160 Z",
  // Wave 2: opposite phase
  "M0,80 C360,135 1080,25 1440,80 C1800,135 2520,25 2880,80 L2880,160 L0,160 Z",
  // Wave 3: higher frequency feel (different amplitude/offset)
  "M0,100 C360,55 1080,145 1440,95 C1800,50 2520,140 2880,100 L2880,160 L0,160 Z",
];

const ANIMATIONS = [
  { name: "wave-slide-fwd", baseDuration: 14 },
  { name: "wave-slide-rev", baseDuration: 10 },
  { name: "wave-slide-mid", baseDuration: 7 },
];

export default function WaveOverlay() {
  const { isPlayingAudio, isProcessing, currentAgentSpeech } = useVoiceAgent();
  const [subtitleText, setSubtitleText] = useState("");

  // Keep subtitle visible briefly after audio stops
  useEffect(() => {
    if (isPlayingAudio && currentAgentSpeech) {
      setSubtitleText(currentAgentSpeech);
    } else if (!isPlayingAudio) {
      const t = setTimeout(() => setSubtitleText(""), 900);
      return () => clearTimeout(t);
    }
  }, [isPlayingAudio, currentAgentSpeech]);

  const state = isPlayingAudio ? "speaking" : isProcessing ? "processing" : "idle";
  const fills = FILLS[state];
  // Waves animate faster while speaking/processing for a lively feel
  const speedFactor = isPlayingAudio ? 0.55 : isProcessing ? 0.75 : 1;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 180,
        pointerEvents: "none",
        zIndex: 40,
        overflow: "hidden",
      }}
    >
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
            animation: `${ANIMATIONS[i].name} ${ANIMATIONS[i].baseDuration * speedFactor}s linear infinite`,
          }}
        >
          <path
            d={d}
            style={{
              fill: fills[i],
              transition: "fill 1.2s ease",
            }}
          />
        </svg>
      ))}

      {/* Live subtitle — appears only while agent is speaking */}
      <AnimatePresence>
        {subtitleText && isPlayingAudio && (
          <motion.div
            key="wave-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: 52,
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: "min(620px, calc(100vw - 140px))",
              padding: "8px 22px",
              background: "rgba(10,10,10,0.70)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderRadius: 28,
              border: "1px solid rgba(139,92,246,0.35)",
              color: "rgba(255,255,255,0.88)",
              fontSize: 13,
              fontFamily: "var(--font-inter, sans-serif)",
              lineHeight: 1.55,
              textAlign: "center",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              whiteSpace: "normal",
            }}
          >
            {subtitleText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
