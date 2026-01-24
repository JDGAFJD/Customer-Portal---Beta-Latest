import { motion } from 'framer-motion'

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  isLoading?: boolean
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export default function Button({ 
  type = 'button',
  isLoading = false, 
  variant = 'primary',
  children, 
  className = '',
  disabled,
  onClick
}: ButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <motion.button
      type={type}
      whileHover={{ 
        y: disabled || isLoading ? 0 : -1, 
        filter: disabled || isLoading ? 'none' : 'brightness(1.03)',
      }}
      whileTap={{ y: 0 }}
      disabled={disabled || isLoading}
      className={`
        w-full font-extrabold text-base cursor-pointer
        disabled:opacity-70 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        transition-all duration-150 ease-out
        ${className}
      `}
      style={{
        height: '54px',
        borderRadius: '14px',
        border: isPrimary ? 'none' : '1px solid rgba(15, 23, 42, 0.15)',
        background: isPrimary 
          ? 'linear-gradient(135deg, #10a37f, #0a8f6a)' 
          : '#ffffff',
        color: isPrimary ? '#ffffff' : '#0f172a',
        boxShadow: isPrimary ? '0 10px 30px rgba(15, 23, 42, 0.10)' : 'none',
        letterSpacing: '0.01em',
      }}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 rounded-full"
            style={{ 
              borderColor: isPrimary ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.2)',
              borderTopColor: isPrimary ? '#ffffff' : '#0f172a'
            }}
          />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
