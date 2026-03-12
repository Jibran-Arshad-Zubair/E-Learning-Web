'use client'

import { memo, forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  icon: Icon,
  className = '',
  type = 'text',
  ...props
}, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-3 
            bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg
            text-white placeholder-gray-500
            focus:outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800
            transition-colors duration-200
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

export default memo(Input)

