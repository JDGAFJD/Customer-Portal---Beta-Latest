import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'

type Step = 'email' | 'verify-otp' | 'reset-password' | 'success'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetToken, setResetToken] = useState('')

  const isSuccess = step === 'success'

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      setStep('verify-otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      setResetToken(data.resetToken)
      setStep('reset-password')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, resetToken })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to resend code')
      }

      setOtp('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Forgot Password'
      case 'verify-otp':
        return 'Verify Email'
      case 'reset-password':
        return 'Reset Password'
      case 'success':
        return 'Password Reset'
      default:
        return 'Forgot Password'
    }
  }

  const getStepSubtitle = () => {
    switch (step) {
      case 'email':
        return 'Enter your email to receive a verification code'
      case 'verify-otp':
        return `We sent a code to ${email}`
      case 'reset-password':
        return 'Create a new password for your account'
      case 'success':
        return 'Your password has been reset successfully'
      default:
        return ''
    }
  }

  return (
    <AuthLayout>
      <h1 className="auth-title">{getStepTitle()}</h1>
      <p className="auth-subtitle">{getStepSubtitle()}</p>

      {isSuccess ? (
        <div className="text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-[#10a37f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#64748b] mb-6">
            You can now sign in with your new password.
          </p>
          <Button onClick={() => navigate('/signin')}>
            Go to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={
          step === 'email' ? handleSubmitEmail :
          step === 'verify-otp' ? handleVerifyOtp :
          handleResetPassword
        }>
          {error && (
            <div className="auth-error">{error}</div>
          )}

          {step === 'email' && (
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              tooltip="Enter the email associated with your account"
            />
          )}

          {step === 'verify-otp' && (
            <>
              <Input
                label="Verification Code"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                tooltip="Check your email for the verification code"
                maxLength={6}
              />
              <p className="auth-footer" style={{ marginTop: 0 }}>
                Didn't receive the code?{' '}
                <button type="button" onClick={resendOtp} className="link" disabled={isLoading}>
                  Resend
                </button>
              </p>
            </>
          )}

          {step === 'reset-password' && (
            <>
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                tooltip="Must be at least 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                tooltip="Re-enter your new password"
              />
            </>
          )}

          {!isSuccess && (
            <Button type="submit" isLoading={isLoading}>
              {step === 'email' && 'Send Verification Code'}
              {step === 'verify-otp' && 'Verify Code'}
              {step === 'reset-password' && 'Reset Password'}
            </Button>
          )}

          <p className="auth-footer">
            Remember your password?{' '}
            <Link to="/signin" className="link">Sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
