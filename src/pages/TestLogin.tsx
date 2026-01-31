import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'

export default function TestLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to proceed')
      }

      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('customer', JSON.stringify(data.customer))
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <img 
          src="/logo.svg" 
          alt="Nomad Internet" 
          className="h-12 mx-auto mb-6"
        />
        <h1 className="text-3xl font-extrabold text-text mb-2">
          Test Portal Access
        </h1>
        <p className="text-muted">
          Enter any email to access the dashboard (testing only)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter any email to test"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          tooltip="Enter the email address you want to test with"
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" isLoading={isLoading}>
          Access Dashboard
        </Button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        This is a testing page. No data will be stored.
      </p>
    </AuthLayout>
  )
}
