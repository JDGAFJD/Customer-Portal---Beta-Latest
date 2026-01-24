import { useState } from 'react'
import { motion } from 'framer-motion'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  tooltip?: string
}

export default function Input({ label, tooltip, className = '', ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="flex items-center justify-between mb-3">
        <label 
          className="block text-sm font-bold"
          style={{ color: 'rgba(15, 23, 42, 0.82)' }}
        >
          {label}
        </label>
        {tooltip && (
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              type="button"
              className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(15, 23, 42, 0.08)' }}
            >
              <svg className="w-3 h-3" style={{ color: '#64748b' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: showTooltip ? 1 : 0, y: showTooltip ? 0 : 5 }}
              className={`absolute right-0 top-full mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 ${showTooltip ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              {tooltip}
              <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-800 rotate-45" />
            </motion.div>
          </div>
        )}
      </div>
      
      <input
        {...props}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        className={`
          w-full rounded-xl text-base transition-all duration-150 ease-out
          ${className}
        `}
        style={{
          height: '52px',
          padding: '0 14px',
          border: isFocused ? '1px solid rgba(16, 163, 127, 0.55)' : '1px solid rgba(15, 23, 42, 0.10)',
          background: 'rgba(255,255,255,0.9)',
          color: '#0f172a',
          boxShadow: isFocused ? '0 0 0 6px rgba(16, 163, 127, 0.12)' : 'none',
        }}
        placeholder={props.placeholder}
      />
    </motion.div>
  )
}
