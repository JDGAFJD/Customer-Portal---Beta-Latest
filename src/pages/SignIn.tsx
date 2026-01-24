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
      <div className="text-center mb-8">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-gray-900 mb-2"
        >
          Welcome Back
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500"
        >
          Sign in to access your Nomad Internet account.
        </motion.p>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon="email"
          tooltip="Use the email you registered with"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          icon="lock"
          tooltip="Your account password"
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-nomad-primary focus:ring-nomad-primary cursor-pointer"
            />
            <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
              Remember me
            </span>
          </label>
          <a 
            href="#" 
            className="text-nomad-primary hover:text-nomad-accent transition-colors font-medium"
          >
            Forgot password?
          </a>
        </div>

        <div className="pt-2">
          <Button type="submit" isLoading={isLoading}>
            Sign In
          </Button>
        </div>

        <p className="text-center text-gray-500 text-sm pt-2">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="text-gray-900 hover:text-nomad-primary transition-colors font-semibold"
          >
            Sign up
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  )
}
