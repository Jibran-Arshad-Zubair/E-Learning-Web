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
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mic_manually_disabled') === 'true';
    }
    return false;
  });
  
  const { getWebsiteContext, formatContextForAgent } = useWebsiteContext();
  const messagesEndRef = useRef(null);
  const avatarRef = useRef(null);
  const isProcessingRef = useRef(false);
  const shouldRestartListeningRef = useRef(false);

  const {
    isConnected,
    isProcessing,
    isPlayingAudio,
    conversationHistory,
    error: agentError,
    sendMessage,
    stopAudio,
    resetConversation,
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
    localStorage.setItem('mic_manually_disabled', isMicManuallyDisabled);
  }, [isMicManuallyDisabled]);

  // Track processing state with ref
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Update avatar state based on agent status
  useEffect(() => {
    if (isProcessing) {
      setAvatarState("processing");
    } else if (isListening) {
      setAvatarState("listening");
    } else if (conversationHistory.length > 0 && 
               conversationHistory[conversationHistory.length - 1]?.role === "assistant") {
      setAvatarState("speaking");
      const timer = setTimeout(() => {
        if (avatarState === "speaking" && !isProcessing && !isListening) {
          setAvatarState("idle");
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setAvatarState("idle");
    }
  }, [isProcessing, isListening, conversationHistory]);

  // Auto-restart listening after agent finishes responding
  useEffect(() => {
    // If not processing, not listening, has permission, and mic not manually disabled
    if (!isProcessing && !isListening && hasPermission && !isMicManuallyDisabled && welcomePlayed) {
      // Small delay to ensure everything is settled
      const timer = setTimeout(() => {
        if (!isProcessingRef.current && !isListening && hasPermission && !isMicManuallyDisabled) {
          console.log("Auto-restarting listening...");
          startListening();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, isListening, hasPermission, isMicManuallyDisabled, welcomePlayed, startListening]);

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
        const welcomeMessage = "Welcome to E-Learning Hub! How can I help you today?";
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
  }, [isConnected, welcomePlayed, sendMessage, getWebsiteContext, formatContextForAgent, hasPermission, startListening, isMicManuallyDisabled]);

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
  useEffect(() => {
    if (isPlayingAudio && !isListening && hasPermission && !isMicManuallyDisabled) {
      startListening(stopAudio);
    }
  }, [isPlayingAudio, isListening, hasPermission, isMicManuallyDisabled, startListening, stopAudio]);

  // Auto-send when transcript is finalized
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
        resetTranscript();
        
        // Don't restart listening here - it will auto-restart after processing completes
      }
    };

    if (transcript && !isListening && transcript.trim()) {
      sendWithContext(transcript.trim());
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
  
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopAudio();
    }
  }, [isMuted, stopAudio]);

  const handleReset = useCallback(() => {
    resetConversation();
    resetTranscript();
    localStorage.removeItem('mic_manually_disabled');
    setIsMicManuallyDisabled(false);
    if (hasPermission && !isListening) {
      startListening();
    }
  }, [resetConversation, resetTranscript, hasPermission, isListening, startListening]);

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

  // Avatar animations and styling based on state
  const getAvatarStyles = () => {
    switch (avatarState) {
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
    switch (avatarState) {
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
          onClick={() => isCollapsed ? handleExpand() : setIsOpen(true)}
          className={`relative p-4 rounded-full transition-all duration-300 ${getAvatarStyles()}`}
        >
          {getAvatarIcon()}
          
          {/* Connection status indicator */}
          <div className="absolute -top-1 -right-1">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse ring-2 ring-white`} />
          </div>
          
          {/* Sound waves animation for speaking state */}
          {avatarState === "speaking" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full bg-green-500 animate-ping opacity-75" />
              <div className="absolute w-[90%] h-[90%] rounded-full bg-green-500 animate-pulse opacity-50" />
            </div>
          )}
          
          {/* Listening rings animation */}
          {avatarState === "listening" && (
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
                  To speak with our AI assistant, please allow microphone access. Your privacy is important to us.
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
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                  <h3 className="font-semibold">AI Voice Assistant</h3>
                  {isMicManuallyDisabled && (
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">Mic Off</span>
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
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className={`absolute inset-0 rounded-full ${getAvatarStyles()} opacity-50`} />
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

              {conversationHistory.map((msg, idx) => (
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
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

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

              {isListening && !isProcessing && (
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
                      <span className="text-sm">Listening...</span>
                      {transcript && (
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
                    isListening ? "Listening..." : "Type your message..."
                  }
                  disabled={isProcessing || isListening}
                  className="flex-1 px-4 py-2 border rounded-full text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isProcessing}
                  className={`p-2 rounded-full transition ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : isMicManuallyDisabled
                      ? "bg-gray-400 dark:bg-gray-600 hover:bg-gray-500"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isListening ? "Stop recording" : "Start recording"}
                >
                  {isListening ? (
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
                    : isListening
                    ? "I'm listening... Speak now!"
                    : isProcessing
                    ? "Agent is responding..."
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