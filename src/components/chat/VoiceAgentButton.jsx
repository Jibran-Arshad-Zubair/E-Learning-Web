"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mic,
  MicOff,
  X,
  Loader2,
  Volume2,
  VolumeX,
  Trash2,
  Send,
  Minimize2,
  Pause,
  Volume,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceAgent } from "../../context/VoiceAgentContext";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useAudioEnergyVAD } from "../../hooks/useAudioEnergyVAD";
import { useWebsiteContext } from "../../hooks/useWebsiteContext";

export default function VoiceAgentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [avatarState, setAvatarState] = useState("idle");
  const [showAvatarControls, setShowAvatarControls] = useState(false);
  const [isMicManuallyDisabled, setIsMicManuallyDisabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mic_manually_disabled") === "true";
    }
    return false;
  });

  const { getWebsiteContext, formatContextForAgent } = useWebsiteContext();
  const { startVAD, stopVAD } = useAudioEnergyVAD();
  const messagesEndRef = useRef(null);
  const avatarRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isListeningRef = useRef(false);
  const shouldRestartListeningRef = useRef(false);
  const avatarDebounceRef = useRef(null);
  const lastSentTranscriptRef = useRef('');
  const systemInitMessageRef = useRef(null);

  const {
    isConnected,
    isProcessing,
    isPlayingAudio,
    currentAgentSpeech,
    conversationHistory,
    error: agentError,
    sendMessage,
    stopAudio,
    resetConversation,
    setMuted,
  } = useVoiceAgent();

  const {
    isListening,
    transcript,
    error: recognitionError,
    startListening,
    stopListening,
    resetTranscript,
    hasPermission,
    requestPermission,
  } = useSpeechRecognition();

  // Persist mic disabled state across page refreshes
  useEffect(() => {
    localStorage.setItem("mic_manually_disabled", isMicManuallyDisabled);
  }, [isMicManuallyDisabled]);

  // Track processing and listening state with refs (for use inside timer callbacks)
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Derived: mic is "logically active" whenever it's actually listening OR when audio is
  // playing and the mic is expected to restart (covers the brief gap between no-speech
  // timeout and the next recognition session starting — the main source of flickering).
  const micIsActive =
    isListening ||
    (isPlayingAudio && hasPermission === true && !isMicManuallyDisabled);

  // Update raw avatar state based on agent status.
  // Priority: mic active (listening) > audio playing (speaking) > thinking (processing) > idle
  useEffect(() => {
    const next = micIsActive
      ? "listening"
      : isPlayingAudio
        ? "speaking"
        : isProcessing
          ? "processing"
          : "idle";
    setAvatarState(next);
  }, [micIsActive, isPlayingAudio, isProcessing]);

  // Debounce avatar state for downward transitions (active → idle/processing) to prevent
  // the brief "idle" flash that appears between phase boundaries (e.g. speaking → idle).
  // Upward transitions (→ listening/speaking) are applied immediately for responsiveness.
  const [displayAvatarState, setDisplayAvatarState] = useState("idle");
  useEffect(() => {
    clearTimeout(avatarDebounceRef.current);
    if (avatarState === "listening" || avatarState === "speaking") {
      setDisplayAvatarState(avatarState);
    } else {
      avatarDebounceRef.current = setTimeout(
        () => setDisplayAvatarState(avatarState),
        200,
      );
    }
    return () => clearTimeout(avatarDebounceRef.current);
  }, [avatarState]);

  // Stop listening as soon as the thinking phase starts (isProcessing=true).
  // This ensures the mic is always off while the agent is computing a response.
  useEffect(() => {
    if (isProcessing && isListening) {
      stopListening();
    }
  }, [isProcessing, isListening, stopListening]);

  // Auto-restart listening after the agent finishes speaking (idle phase only).
  // Effect 2 below handles the mic during audio playback; this effect handles idle.
  useEffect(() => {
    if (
      !isProcessing &&
      !isPlayingAudio &&
      !isListening &&
      hasPermission &&
      !isMicManuallyDisabled &&
      welcomePlayed
    ) {
      const timer = setTimeout(() => {
        // Use refs so the callback reads fresh values, not the stale closure snapshot
        if (
          !isProcessingRef.current &&
          !isListeningRef.current &&
          hasPermission &&
          !isMicManuallyDisabled
        ) {
          console.log("Auto-restarting listening...");
          startListening();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    isProcessing,
    isPlayingAudio,
    isListening,
    hasPermission,
    isMicManuallyDisabled,
    welcomePlayed,
    startListening,
  ]);

  // Auto-start welcome message flow
  useEffect(() => {
    const initWelcomeFlow = async () => {
      const hasPlayedWelcome = sessionStorage.getItem("welcome_played");

      if (!hasPlayedWelcome && isConnected && !welcomePlayed) {
        setWelcomePlayed(true);
        sessionStorage.setItem("welcome_played", "true");

        // Send short welcome message
        const context = getWebsiteContext();
        const formattedContext = formatContextForAgent(context);

        // Short and sweet welcome message
        const welcomeMessage =
          "Welcome to E-Learning Hub! How can I help you today?";
        systemInitMessageRef.current = welcomeMessage;
        await sendMessage(welcomeMessage, formattedContext);

        // Show permission dialog after welcome
        setTimeout(() => {
          if (!hasPermission) {
            setShowPermissionDialog(true);
          } else if (!isMicManuallyDisabled) {
            startListening();
          }
        }, 2000);
      }
    };

    initWelcomeFlow();
  }, [
    isConnected,
    welcomePlayed,
    sendMessage,
    getWebsiteContext,
    formatContextForAgent,
    hasPermission,
    startListening,
    isMicManuallyDisabled,
  ]);

  const enableMicrophone = useCallback(async () => {
    setShowPermissionDialog(false);
    try {
      const granted = await requestPermission();
      if (granted) {
        setIsMicManuallyDisabled(false);
        startListening();
      }
    } catch (err) {
      console.error("Microphone permission error:", err);
    }
  }, [requestPermission, startListening]);

  const cancelMicrophone = useCallback(() => {
    setShowPermissionDialog(false);
    setIsMicManuallyDisabled(true);
  }, []);

  // Start listening as soon as audio playback begins so the first detected word
  // triggers stopAudio() immediately — before the full utterance is recognised.
  // The 200ms cooldown prevents the rapid-restart loop (no-speech timeout → immediate
  // restart → no-speech timeout) from causing visible icon flicker. Re-checking
  // isListeningRef inside the callback avoids a stale-closure double-start.
  useEffect(() => {
    if (
      isPlayingAudio &&
      !isListening &&
      hasPermission &&
      !isMicManuallyDisabled
    ) {
      const timer = setTimeout(() => {
        if (!isListeningRef.current) {
          // Pass currentAgentSpeech so the recognition hook can detect and
          // suppress echo (agent voice leaking from speakers into the mic).
          startListening(stopAudio, currentAgentSpeech);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [
    isPlayingAudio,
    isListening,
    hasPermission,
    isMicManuallyDisabled,
    startListening,
    stopAudio,
    currentAgentSpeech,
  ]);

  // VAD-based interruption: run energy VAD during audio playback so that even
  // short fallback responses (~1 s) are stopped within ~100 ms of the user
  // starting to speak — well before SpeechRecognition fires its first onresult.
  // getUserMedia uses echoCancellation:true so the agent's own TTS output is
  // subtracted by the browser's AEC and does not trigger the VAD.
  useEffect(() => {
    if (isPlayingAudio && hasPermission && !isMicManuallyDisabled) {
      startVAD(stopAudio);
      return () => stopVAD();
    }
  }, [
    isPlayingAudio,
    hasPermission,
    isMicManuallyDisabled,
    startVAD,
    stopVAD,
    stopAudio,
  ]);

  // Auto-send when transcript is finalized.
  // Guard: only send when this transcript text hasn't been sent yet — prevents the
  // duplicate that occurs when sendMessage's conversationHistory dep changes and
  // re-creates the function reference, causing this effect to re-fire while the
  // same transcript is still in state. Using the transcript text itself (not a
  // boolean lock) means a new, different transcript fires immediately even if the
  // previous sendMessage is still awaiting audio playback.
  useEffect(() => {
    const sendWithContext = async (message) => {
      if (message && message.trim()) {
        // Stop listening while sending
        if (isListening) {
          stopListening();
        }

        const context = getWebsiteContext();
        const formattedContext = formatContextForAgent(context);
        await sendMessage(message, formattedContext);
        // Clear transcript and reset the guard so the same phrase can be sent
        // again in a later turn if the user says it a second time.
        resetTranscript();
        lastSentTranscriptRef.current = '';

        // Don't restart listening here - it will auto-restart after processing completes
      }
    };

    const trimmed = transcript?.trim();
    if (trimmed && !isListening && trimmed !== lastSentTranscriptRef.current) {
      lastSentTranscriptRef.current = trimmed;
      sendWithContext(trimmed);
    }
  }, [
    transcript,
    isListening,
    sendMessage,
    resetTranscript,
    getWebsiteContext,
    formatContextForAgent,
    stopListening,
  ]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, scrollToBottom]);

  const handleMicClick = useCallback(async () => {
    if (isListening) {
      // Manually stop listening
      stopListening();
      setIsMicManuallyDisabled(true);
    } else {
      // Manually start listening
      if (!hasPermission) {
        setShowPermissionDialog(true);
      } else {
        setIsMicManuallyDisabled(false);
        startListening();
      }
    }
  }, [isListening, stopListening, startListening, hasPermission]);

  const handleTextSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (inputText.trim() && !isProcessing) {
        const text = inputText.trim();
        setInputText("");

        // Stop listening if active
        if (isListening) {
          stopListening();
        }

        const context = getWebsiteContext();
        const formattedContext = formatContextForAgent(context);

        await sendMessage(text, formattedContext);
      }
    },
    [
      inputText,
      isProcessing,
      isListening,
      sendMessage,
      getWebsiteContext,
      formatContextForAgent,
      stopListening,
    ],
  );

  useEffect(() => {
    const audioEl = document.querySelector("audio");
    if (audioEl) {
      audioEl.muted = isMuted;
    }
  }, [isPlayingAudio, isMuted]);

  // Replace your entire toggleMute with this:
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  }, [setMuted]);

  const handleReset = useCallback(() => {
    resetConversation();
    resetTranscript();
    localStorage.removeItem("mic_manually_disabled");
    setIsMicManuallyDisabled(false);
    if (hasPermission && !isListening) {
      startListening();
    }
  }, [
    resetConversation,
    resetTranscript,
    hasPermission,
    isListening,
    startListening,
  ]);

  const handlePausePlay = useCallback(() => {
    stopAudio();
  }, [stopAudio]);

  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
    setIsOpen(false);
  }, []);

  const handleExpand = useCallback(() => {
    setIsCollapsed(false);
    setIsOpen(true);
  }, []);

  // Avatar animations and styling — use the debounced displayAvatarState so
  // brief intermediate states don't cause visible flicker between phases.
  const getAvatarStyles = () => {
    switch (displayAvatarState) {
      case "speaking":
        return "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50 animate-pulse";
      case "listening":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50 ring-4 ring-blue-400";
      case "processing":
        return "bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/50";
      default:
        return "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-xl";
    }
  };

  const getAvatarIcon = () => {
    switch (displayAvatarState) {
      case "speaking":
        return <Volume className="w-8 h-8 text-white animate-pulse" />;
      case "listening":
        return <Mic className="w-8 h-8 text-white animate-bounce" />;
      case "processing":
        return <Loader2 className="w-8 h-8 text-white animate-spin" />;
      default:
        return <Mic className="w-8 h-8 text-white" />;
    }
  };

  return (
    <>
      {/* Animated Avatar - Main UI */}
      <motion.div
        ref={avatarRef}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={() => setShowAvatarControls(true)}
        onMouseLeave={() => setShowAvatarControls(false)}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => (isCollapsed ? handleExpand() : setIsOpen(true))}
          className={`relative p-4 rounded-full transition-all duration-300 ${getAvatarStyles()}`}
        >
          {getAvatarIcon()}

          {/* Connection status indicator */}
          <div className="absolute -top-1 -right-1">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse ring-2 ring-white`}
            />
          </div>

          {/* Sound waves animation for speaking state */}
          {displayAvatarState === "speaking" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full bg-green-500 animate-ping opacity-75" />
              <div className="absolute w-[90%] h-[90%] rounded-full bg-green-500 animate-pulse opacity-50" />
            </div>
          )}

          {/* Listening rings animation */}
          {displayAvatarState === "listening" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full border-2 border-blue-400 animate-ping" />
              <div className="absolute w-[110%] h-[110%] rounded-full border border-blue-400 animate-pulse" />
            </div>
          )}

          {/* Manual disable indicator */}
          {isMicManuallyDisabled && hasPermission && (
            <div className="absolute -bottom-1 -right-1">
              <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </motion.button>

        {/* Floating controls on hover */}
        <AnimatePresence>
          {showAvatarControls && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={handlePausePlay}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                title="Pause audio"
              >
                <Pause className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={handleCollapse}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                title="Collapse"
              >
                <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Permission Dialog Modal */}
      <AnimatePresence>
        {showPermissionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => cancelMicrophone()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Enable Microphone
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  To speak with our AI assistant, please allow microphone
                  access. Your privacy is important to us.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelMicrophone}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={enableMicrophone}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
                  >
                    Allow
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-h-[70vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`}
                  />
                  <h3 className="font-semibold">AI Voice Assistant</h3>
                  {isMicManuallyDisabled && (
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                      Mic Off
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:bg-white/20 rounded transition"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-1 hover:bg-white/20 rounded transition"
                    title="Reset conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCollapse}
                    className="p-1 hover:bg-white/20 rounded transition"
                    title="Collapse"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded transition"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs opacity-90 mt-1">
                {isConnected ? "Connected" : "Connecting..."}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
              {conversationHistory.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-32">
                  <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <div
                      className={`absolute inset-0 rounded-full ${getAvatarStyles()} opacity-50`}
                    />
                    {getAvatarIcon()}
                  </div>
                  <p className="text-sm font-medium">Ready to Help You!</p>
                  <p className="text-xs mt-2">
                    {isMicManuallyDisabled
                      ? "Click the mic button to start speaking"
                      : "I'm listening! Just start speaking..."}
                  </p>
                </div>
              )}

              {conversationHistory.map((msg, idx) => {
                if (msg.role === "user" && msg.content === systemInitMessageRef.current) return null;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white rounded-br-none"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {micIsActive && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                        <div
                          className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-sm">
                        {isListening ? "Listening..." : "Mic ready..."}
                      </span>
                      {transcript && isListening && (
                        <span className="text-xs text-gray-500 max-w-[150px] truncate">
                          {transcript}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {(agentError || recognitionError) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm"
                >
                  {agentError || recognitionError}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleTextSubmit}
              className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    micIsActive ? "Listening..." : "Type your message..."
                  }
                  disabled={isProcessing || micIsActive}
                  className="flex-1 px-4 py-2 border rounded-full text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isProcessing}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    micIsActive
                      ? "bg-red-500 text-white animate-pulse"
                      : isMicManuallyDisabled
                        ? "bg-gray-400 dark:bg-gray-600 hover:bg-gray-500"
                        : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={micIsActive ? "Stop recording" : "Start recording"}
                >
                  {micIsActive ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing || isListening}
                  className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {isConnected
                  ? !hasPermission
                    ? "Click mic to enable microphone"
                    : isMicManuallyDisabled
                      ? "Mic is off. Click mic to start speaking"
                      : isProcessing
                        ? "Agent is thinking..."
                        : micIsActive
                          ? "I'm listening... Speak now!"
                          : "Mic is on. Click mic to pause listening"
                  : "Connecting to voice agent..."}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
