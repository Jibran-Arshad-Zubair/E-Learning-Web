'use client'

import { memo, useState } from 'react'
import Image from 'next/image'

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

function Avatar({ 
  src, 
  alt = 'Avatar', 
  name = '', 
  size = 'md', 
  className = '' 
}) {
  const [error, setError] = useState(false)
  
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (!src || error) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full bg-purple-800/30 
          flex items-center justify-center
          font-semibold text-purple-400
          ${className}
        `}
      >
        {initials || '?'}
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

export default memo(Avatar)
