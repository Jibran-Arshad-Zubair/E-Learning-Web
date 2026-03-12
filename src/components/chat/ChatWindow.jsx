'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Send, ArrowLeft, MoreVertical } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { messages as initialMessages } from '../../constants/data'

function ChatWindow({ contact, onBack, isMobile = false }) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = useCallback((e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      sender: 'You',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      isSent: true
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }, [newMessage])

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center text-center px-4">
        <div>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <Send className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Select a Conversation</h3>
          <p className="text-gray-400">Choose a contact to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-[#2A2A2A]">
        {isMobile && (
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}
        
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={contact.avatar}
            alt={contact.name}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex-grow">
          <h3 className="font-semibold text-white">{contact.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${contact.online ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-400">
              {contact.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <button className="p-2 hover:bg-white/10 rounded-lg">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isLast={index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-purple-800"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-purple-800 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default memo(ChatWindow)

