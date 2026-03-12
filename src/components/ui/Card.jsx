'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

function Card({ 
  children, 
  className = '', 
  hover = true,
  animate = true,
  ...props 
}) {
  const Component = animate ? motion.div : 'div'
  
  return (
    <Component
      variants={animate ? cardVariants : undefined}
      initial={animate ? "initial" : undefined}
      animate={animate ? "animate" : undefined}
      whileHover={hover ? { 
        scale: 1.02,
        borderColor: 'rgba(107, 33, 168, 0.5)',
      } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        bg-[#111111] rounded-xl border border-[#2A2A2A]
        p-6 transition-all duration-200
        ${hover ? 'hover:shadow-lg hover:shadow-purple-900/20' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  )
}

export default memo(Card)
