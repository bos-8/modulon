// @file: client/src/app/[locale]/verify-email-link/page.tsx

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import api from '@/lib/api/axios'

export default function VerifyEmailLinkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      verifyToken(token)
    } else {
      setStatus('error')
      setError('Missing verification token in the link.')
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
      setError(err.response?.data?.message || 'Verification failed.')
    }
  }

  return (
    <main className="flex justify-center px-4 pt-20 pb-10 bg-gray-50 dark:bg-gray-900">
      <div className="min-w-[320px] sm:min-w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Email verification
        </h1>

        {status === 'verifying' && (
          <p className="text-blue-500">Verifying your email...</p>
        )}
        {status === 'success' && (
          <p className="text-green-600">Email verified successfully! Redirecting to login...</p>
        )}
        {status === 'error' && (
          <p className="text-red-600">{error}</p>
        )}
      </div>
    </main>
  )
}
// EOF
