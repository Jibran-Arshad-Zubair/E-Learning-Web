'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'

const bubbleVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

function MessageBubble({ message, isLast = false }) {
  const isSent = message.isSent

  return (
    <motion.div
      variants={bubbleVariants}
      initial={isLast ? "hidden" : false}
      animate="visible"
      transition={{ duration: 0.3 }}
      className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl
          ${isSent 
            ? 'bg-purple-800 text-white rounded-br-sm' 
            : 'bg-[#1A1A1A] text-gray-200 rounded-bl-sm'
          }
        `}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <span className={`text-xs mt-1 block ${isSent ? 'text-purple-200' : 'text-gray-500'}`}>
          {message.time}
        </span>
      </div>
    </motion.div>
  )
}

export default memo(MessageBubble)
