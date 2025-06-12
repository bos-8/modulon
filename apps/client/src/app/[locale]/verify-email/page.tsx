// @file: client/src/app/[locale]/verify-email/page.tsx

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import api from '@/lib/api/axios'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')

  useEffect(() => {
    if (token) {
      verifyToken(token)
    }
  }, [token])

  const verifyToken = async (token: string) => {
    setStatus('verifying')
    setError(null)
    try {
      await api.post('/auth/verify-email-code', { token })
      setStatus('success')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setStatus('error')
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResendStatus('sending')
    try {
      await api.post('/auth/send-verification-code', { email })
      setResendStatus('sent')
    } catch {
      setResendStatus('failed')
    }
  }

  return (
    <main className="flex justify-center px-4 pt-20 pb-10 bg-gray-50 dark:bg-gray-900">
      <div className="min-w-[320px] sm:min-w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
          Verify your email
        </h1>

        {email && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            We've sent a verification link to <strong>{email}</strong>.
          </p>
        )}

        {status === 'verifying' && (
          <p className="text-center text-blue-500">Verifying...</p>
        )}
        {status === 'success' && (
          <p className="text-center text-green-600">Email verified successfully. Redirecting...</p>
        )}
        {status === 'error' && (
          <p className="text-center text-red-600">{error}</p>
        )}

        <button
          onClick={handleResend}
          disabled={resendStatus === 'sending' || !email}
          className="w-full mt-2 p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {resendStatus === 'sent'
            ? 'Verification email resent'
            : resendStatus === 'sending'
              ? 'Sending...'
              : 'Resend verification email'}
        </button>
      </div>
    </main>
  )
}
// EOF
