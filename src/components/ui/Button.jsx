'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const buttonVariants = {
  primary: 'bg-purple-800 hover:bg-purple-700 text-white border-purple-800',
  outline: 'bg-transparent border-white text-white hover:bg-white/10',
  ghost: 'bg-transparent text-white hover:bg-white/10 border-transparent',
}

const sizeVariants = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 
        font-semibold rounded-lg border-2 
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonVariants[variant]}
        ${sizeVariants[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
}

export default memo(Button)

