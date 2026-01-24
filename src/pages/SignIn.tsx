import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Sign in with:', { email, password })
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-10">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-extrabold mb-3"
          style={{ fontSize: '34px', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#0f172a' }}
        >
          Welcome Back
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="leading-relaxed"
          style={{ color: '#64748b', lineHeight: 1.6 }}
        >
          Sign in to access your Nomad Internet account
        </motion.p>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid gap-8"
      >
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          tooltip="Use the email you registered with"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          tooltip="Your account password"
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl text-sm"
            style={{ 
              background: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626'
            }}
          >
            {error}
          </motion.div>
        )}

        <div className="flex items-center justify-between text-sm" style={{ marginTop: '-6px' }}>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-[18px] h-[18px] rounded cursor-pointer"
              style={{ accentColor: '#10a37f' }}
            />
            <span style={{ color: 'rgba(15, 23, 42, 0.78)' }}>
              Remember me
            </span>
          </label>
          <a 
            href="#" 
            className="font-bold hover:underline"
            style={{ color: '#0a8f6a' }}
          >
            Forgot password?
          </a>
        </div>

        <Button type="submit" isLoading={isLoading}>
          Sign In
        </Button>

        <p className="text-center text-sm" style={{ color: '#64748b', lineHeight: 1.6 }}>
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="font-extrabold hover:underline"
            style={{ color: '#0a8f6a' }}
          >
            Sign up
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  )
}
