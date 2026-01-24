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
  const baseStyles = `
    w-full py-3.5 px-6 rounded-xl font-semibold text-base
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  `
  
  const variants = {
    primary: `
      bg-gradient-to-r from-nomad-primary to-nomad-accent text-white
      hover:shadow-lg hover:shadow-nomad-primary/25 hover:-translate-y-0.5
      active:translate-y-0 active:shadow-md
    `,
    secondary: `
      bg-white border-2 border-gray-200 text-gray-700
      hover:border-nomad-primary hover:text-nomad-primary
      active:bg-gray-50
    `
  }

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
