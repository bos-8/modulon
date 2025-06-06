// @file: client/src/app/[locale]/login/page.tsx

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormValues } from './loginForm.schema'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useInitializeSession } from '@/lib/auth/auth.context'
import { Throbber } from '@/components/ui/Throbber'

import api from '@/lib/api/axios'

export default function LoginPage() {
  const t = useTranslations('Login')
  const router = useRouter()
  const initializeUserSession = useInitializeSession()


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema(t)),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await api.post('/auth/login', data)
      await initializeUserSession();
      router.push('/dashboard')
      window.location.reload()
    } catch (err: any) {
      alert(err?.response?.data?.message || t('errors.default'))
    }
  }

  return (
    <main className="flex justify-center px-4 pt-20 pb-10 bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-w-[320px] sm:min-w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          {t('title')}
        </h1>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
            {t('email')}
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
            {t('password')}
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 dark:bg-green-500 text-white dark:text-gray-900 p-2 rounded hover:bg-green-700 dark:hover:bg-green-400 transition flex items-center justify-center"
        >
          {isSubmitting ? <Throbber className="w-5 h-5" /> : t('submit')}
        </button>
      </form>
    </main>
  )
}
// EOF
