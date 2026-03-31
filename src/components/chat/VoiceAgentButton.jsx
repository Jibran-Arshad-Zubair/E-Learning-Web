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
  Maximize2,
  Pause,
  Play,
  Volume,
  Volume1,
  VolumeX as MuteIcon,
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
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [avatarState, setAvatarState] = useState("idle"); // idle, speaking, listening, processing
  const [showAvatarControls, setShowAvatarControls] = useState(false);
  
  const { getWebsiteContext, formatContextForAgent } = useWebsiteContext();
  const messagesEndRef = useRef(null);
  const avatarRef = useRef(null);

  const {
    isConnected,
    isProcessing,
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

  // Update avatar state based on agent status
  useEffect(() => {
    if (isProcessing) {
      setAvatarState("processing");
    } else if (isListening) {
      setAvatarState("listening");
    } else if (conversationHistory.length > 0 && 
               conversationHistory[conversationHistory.length - 1]?.role === "assistant") {
      // Simulate speaking state for 2 seconds when new assistant message arrives
      setAvatarState("speaking");
      const timer = setTimeout(() => {
        if (avatarState === "speaking") {
          setAvatarState("idle");
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setAvatarState("idle");
    }
  }, [isProcessing, isListening, conversationHistory]);

  // Auto-start welcome message and microphone permission flow
  useEffect(() => {
    const initWelcomeFlow = async () => {
      // Check if welcome message has been played in this session
      const hasPlayedWelcome = sessionStorage.getItem("welcome_played");
      
      if (!hasPlayedWelcome && isConnected && !welcomePlayed) {
        setWelcomePlayed(true);
        sessionStorage.setItem("welcome_played", "true");
        
        // Get website context and send welcome message
        const context = getWebsiteContext();
        const formattedContext = formatContextForAgent(context);
        
        // Send welcome message to agent
        const welcomeMessage = "Welcome to the website";
        await sendMessage(welcomeMessage, formattedContext);
        
        // After welcome message plays, request microphone permission
        setTimeout(() => {
          if (!hasPermission) {
            requestMicrophonePermission();
          } else {
            setMicrophonePermission(true);
            startListening();
          }
        }, 3000);
      }
    };
    
    initWelcomeFlow();
  }, [isConnected, welcomePlayed, sendMessage, getWebsiteContext, formatContextForAgent, hasPermission, startListening]);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      await requestPermission();
      setMicrophonePermission(true);
      startListening();
    } catch (err) {
      setMicrophonePermission(false);
      console.error("Microphone permission denied:", err);
    }
  }, [requestPermission, startListening]);

  // Auto-send when transcript is finalized
  useEffect(() => {
    const sendWithContext = async (message) => {
      const context = getWebsiteContext();
      const formattedContext = formatContextForAgent(context);
      await sendMessage(message, formattedContext);
    };

    if (transcript && !isListening && transcript.trim()) {
      sendWithContext(transcript.trim());
      resetTranscript();
    }
  }, [
    transcript,
    isListening,
    sendMessage,
    resetTranscript,
    getWebsiteContext,
    formatContextForAgent,
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
      stopListening();
    } else {
      if (!hasPermission) {
        await requestMicrophonePermission();
      } else {
        startListening();
      }
    }
  }, [isListening, stopListening, startListening, hasPermission, requestMicrophonePermission]);

  const handleTextSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (inputText.trim() && !isProcessing && !isListening) {
        const text = inputText.trim();
        setInputText("");

        // Always send with website context
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
  }, [resetConversation, resetTranscript]);

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
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:bg-white/20 rounded transition"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <MuteIcon className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
                  <p className="text-sm font-medium">Welcome to E-Learning Hub!</p>
                  <p className="text-xs mt-2">
                    {microphonePermission === false 
                      ? "Please allow microphone access to speak with me"
                      : "Click the mic to start speaking or type your message"}
                  </p>
                  {microphonePermission === false && (
                    <button
                      onClick={requestMicrophonePermission}
                      className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition"
                    >
                      Enable Microphone
                    </button>
                  )}
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

              {isListening && (
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
                  ? microphonePermission === false
                    ? "Please enable microphone to speak"
                    : "Click mic to speak, or type your message"
                  : "Connecting to voice agent..."}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}