// src/components/chat/VoiceAgentButton.jsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, X, Loader2, Volume2, VolumeX, Trash2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceAgent } from '../../context/VoiceAgentContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function VoiceAgentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef(null);
  
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
  } = useSpeechRecognition();

  // Auto-send when transcript is finalized
  useEffect(() => {
    if (transcript && !isListening && transcript.trim()) {
      sendMessage(transcript.trim());
      resetTranscript();
    }
  }, [transcript, isListening, sendMessage, resetTranscript]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, scrollToBottom]);

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleTextSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing && !isListening) {
      const text = inputText.trim();
      setInputText('');
      await sendMessage(text);
    }
  }, [inputText, isProcessing, isListening, sendMessage]);

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

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <Mic className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                  <h3 className="font-semibold">AI Voice Assistant</h3>
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
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs opacity-90 mt-1">
                {isConnected ? 'Connected' : 'Connecting...'}
              </p>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
              {conversationHistory.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-32">
                  <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click the microphone to start speaking</p>
                  <p className="text-xs mt-1">or type your message below</p>
                </div>
              )}
              
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {isListening && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-sm">Listening...</span>
                      {transcript && (
                        <span className="text-xs text-gray-500 max-w-[150px] truncate">
                          {transcript}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {(agentError || recognitionError) && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  {agentError || recognitionError}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleTextSubmit} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Type your message..."}
                  disabled={isProcessing || isListening}
                  className="flex-1 px-4 py-2 border rounded-full text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isProcessing}
                  className={`p-2 rounded-full transition ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isListening ? "Stop recording" : "Start recording"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
                  ? 'Click mic to speak, or type your message' 
                  : 'Connecting to voice agent...'}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}