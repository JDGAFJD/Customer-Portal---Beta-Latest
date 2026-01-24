import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'

type Step = 'email' | 'confirm-email' | 'phone' | 'verify-phone' | 'verify-email'

export default function SignUp() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [, setCustomerNotFound] = useState(false)

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''
    if (digits.length <= 1) return `+${digits}`
    if (digits.length <= 4) return `+${digits.slice(0, 1)} (${digits.slice(1)}`
    if (digits.length <= 7) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`
  }

  const getCleanPhoneNumber = (formatted: string): string => {
    const digits = formatted.replace(/\D/g, '')
    return `+${digits}`
  }

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const digits = phoneNumber.replace(/\D/g, '')
    return digits.length === 11 && digits.startsWith('1')
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  const checkCustomerEmail = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('https://app.lrlos.com/webhook/Chargebee/getcustomersusingemail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, keyword: 'signup' })
      })
      
      const data = await response.json()
      
      if (Array.isArray(data) && data.length === 0) {
        setCustomerNotFound(true)
        setStep('confirm-email')
      } else {
        setStep('phone')
      }
    } catch {
      setError('Unable to verify email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmEmail = () => {
    setCustomerNotFound(false)
    setStep('phone')
  }

  const sendPhoneOtp = async () => {
    setIsLoading(true)
    setError('')
    
    const cleanPhone = getCleanPhoneNumber(phone)
    
    if (!validatePhoneNumber(cleanPhone)) {
      setError('Please enter a valid US phone number (+1 XXX XXX XXXX)')
      setIsLoading(false)
      return
    }
    
    try {
      await fetch('https://app.lrlos.com/webhook/twilio/sendotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: cleanPhone, 
          indicator: 'phone verification sign up' 
        })
      })
      
      setStep('verify-phone')
    } catch {
      setError('Unable to send verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const sendEmailOtp = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await fetch('https://app.lrlos.com/webhook/twilio/sendotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          indicator: 'email verification Sign up' 
        })
      })
    } catch {
      setError('Unable to send email verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) {
      setError('Please enter the 6-digit code sent to your phone')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await sendEmailOtp()
      setStep('verify-email')
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      setError('Please enter the 6-digit code sent to your email')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Sign up complete! You can now access your account.')
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    switch (step) {
      case 'email':
        await checkCustomerEmail()
        break
      case 'confirm-email':
        handleConfirmEmail()
        break
      case 'phone':
        await sendPhoneOtp()
        break
      case 'verify-phone':
        await verifyPhoneOtp()
        break
      case 'verify-email':
        await verifyEmailOtp()
        break
    }
  }

  const stepConfig = {
    'email': {
      title: 'Create Your Account',
      subtitle: 'Enter the email you used to sign up for Nomad Internet services'
    },
    'confirm-email': {
      title: 'Email Not Found',
      subtitle: 'We couldn\'t find an account with this email. Please verify this is the email you used to sign up for our services.'
    },
    'phone': {
      title: 'Verify Your Phone',
      subtitle: 'Enter your US phone number to receive a verification code'
    },
    'verify-phone': {
      title: 'Enter Phone Code',
      subtitle: 'We sent a verification code to your phone'
    },
    'verify-email': {
      title: 'Enter Email Code',
      subtitle: 'We sent a verification code to your email'
    }
  }

  const getProgressWidth = () => {
    switch (step) {
      case 'email': return '20%'
      case 'confirm-email': return '20%'
      case 'phone': return '40%'
      case 'verify-phone': return '70%'
      case 'verify-email': return '100%'
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <div 
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(15, 23, 42, 0.08)' }}
        >
          <motion.div 
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(135deg, #10a37f, #0a8f6a)' }}
            initial={{ width: 0 }}
            animate={{ width: getProgressWidth() }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-10">
            <h1 
              className="font-extrabold mb-3"
              style={{ fontSize: '34px', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#0f172a' }}
            >
              {stepConfig[step].title}
            </h1>
            <p style={{ color: '#64748b', lineHeight: 1.6 }}>
              {stepConfig[step].subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-8">
              {step === 'email' && (
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  tooltip="Use the email you used when signing up for Nomad Internet"
                />
              )}

              {step === 'confirm-email' && (
                <div className="grid gap-6">
                  <div 
                    className="p-5 rounded-xl text-sm leading-relaxed"
                    style={{ 
                      background: 'rgba(245, 158, 11, 0.08)', 
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      color: '#92400e'
                    }}
                  >
                    The email <strong>{email}</strong> was not found in our system. 
                    If this is correct, we'll proceed with phone verification.
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="flex-1 font-bold transition-colors hover:bg-gray-50"
                      style={{ 
                        height: '54px',
                        borderRadius: '14px',
                        border: '1px solid rgba(15, 23, 42, 0.15)',
                        color: '#0f172a'
                      }}
                    >
                      Use Different Email
                    </button>
                    <Button type="submit" className="flex-1">
                      Continue Anyway
                    </Button>
                  </div>
                </div>
              )}

              {step === 'phone' && (
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (512) 299-9278"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  tooltip="US phone numbers only (+1 format)"
                />
              )}

              {step === 'verify-phone' && (
                <div className="grid gap-6">
                  <Input
                    label="Verification Code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    tooltip="Check your phone for the SMS code"
                    maxLength={6}
                  />
                  <p className="text-sm text-center" style={{ color: '#64748b' }}>
                    Didn't receive the code?{' '}
                    <button 
                      type="button"
                      onClick={() => sendPhoneOtp()}
                      className="font-bold hover:underline"
                      style={{ color: '#0a8f6a' }}
                    >
                      Resend
                    </button>
                  </p>
                </div>
              )}

              {step === 'verify-email' && (
                <div className="grid gap-6">
                  <Input
                    label="Email Verification Code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    tooltip="Check your email for the verification code"
                    maxLength={6}
                  />
                  <p className="text-sm text-center" style={{ color: '#64748b' }}>
                    Didn't receive the code?{' '}
                    <button 
                      type="button"
                      onClick={() => sendEmailOtp()}
                      className="font-bold hover:underline"
                      style={{ color: '#0a8f6a' }}
                    >
                      Resend
                    </button>
                  </p>
                </div>
              )}

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

              {step !== 'confirm-email' && (
                <Button type="submit" isLoading={isLoading}>
                  {step === 'email' && 'Continue'}
                  {step === 'phone' && 'Send Verification Code'}
                  {step === 'verify-phone' && 'Verify Phone'}
                  {step === 'verify-email' && 'Complete Sign Up'}
                </Button>
              )}

              {step === 'email' && (
                <p className="text-center text-sm" style={{ color: '#64748b', lineHeight: 1.6 }}>
                  Already have an account?{' '}
                  <Link 
                    to="/signin" 
                    className="font-extrabold hover:underline"
                    style={{ color: '#0a8f6a' }}
                  >
                    Sign in
                  </Link>
                </p>
              )}
            </form>
          </motion.div>
        </AnimatePresence>
    </AuthLayout>
  )
}
