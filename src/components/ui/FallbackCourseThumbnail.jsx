'use client'

import { memo } from 'react'

function FallbackCourseThumbnail() {
  return (
    <div className="relative w-full aspect-video bg-[#0A0A0A] flex flex-col items-center justify-center">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(107,33,168,0.15)_0%,_transparent_70%)]" />
      
      {/* Book Icon SVG */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 relative z-10"
      >
        <path
          d="M8 12C8 10.8954 8.89543 10 10 10H28C30.2091 10 32 11.7909 32 14V52C32 50.8954 31.1046 50 30 50H10C8.89543 50 8 49.1046 8 48V12Z"
          fill="#6B21A8"
          fillOpacity="0.3"
        />
        <path
          d="M56 12C56 10.8954 55.1046 10 54 10H36C33.7909 10 32 11.7909 32 14V52C32 50.8954 32.8954 50 34 50H54C55.1046 50 56 49.1046 56 48V12Z"
          fill="#6B21A8"
          fillOpacity="0.3"
        />
        <path
          d="M10 10H28C30.2091 10 32 11.7909 32 14V52C32 50.8954 31.1046 50 30 50H10C8.89543 50 8 49.1046 8 48V12C8 10.8954 8.89543 10 10 10Z"
          stroke="#6B21A8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M54 10H36C33.7909 10 32 11.7909 32 14V52C32 50.8954 32.8954 50 34 50H54C55.1046 50 56 49.1046 56 48V12C56 10.8954 55.1046 10 54 10Z"
          stroke="#6B21A8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 20H24"
          stroke="#6B21A8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14 28H22"
          stroke="#6B21A8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M40 20H50"
          stroke="#6B21A8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M40 28H48"
          stroke="#6B21A8"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Text */}
      <span className="relative z-10 mt-3 text-xs text-gray-400 uppercase tracking-widest">
        Course Preview
      </span>
    </div>
  )
}

export default memo(FallbackCourseThumbnail)
