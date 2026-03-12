'use client'

import { memo } from 'react'

const colorVariants = {
  purple: 'bg-purple-800/20 text-purple-400 border-purple-800/30',
  green: 'bg-green-800/20 text-green-400 border-green-800/30',
  red: 'bg-red-800/20 text-red-400 border-red-800/30',
  gray: 'bg-gray-800/20 text-gray-400 border-gray-800/30',
}

function Badge({ label, color = 'purple', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 
        text-xs font-medium rounded-full border
        ${colorVariants[color]}
        ${className}
      `}
    >
      {label}
    </span>
  )
}

export default memo(Badge)
