// @file: src/app/[locale]/register/page.tsx

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { signupSchema, SignupFormValues } from './registerForm.schema'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/axios'

export default function SignupPage() {
  const t = useTranslations()
  const schema = signupSchema(t)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    const { confirmPassword, ...payload } = data
    try {
      await api.post('/auth/register', payload)
      router.push('/login')
    } catch (err: any) {
      alert(err.response?.data?.message || t('Signup.errors.default'))
    }
  }

  return (
    <main className="flex justify-center px-4 pt-20 pb-10 bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-w-[320px] sm:min-w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
          {t('Signup.title')}
        </h1>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('Signup.email')}
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('Signup.password')}
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('Signup.confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 dark:bg-green-500 text-white dark:text-gray-900 p-2 rounded hover:bg-green-700 dark:hover:bg-green-400 transition"
          >
            {t('Signup.submit')}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {t('Signup.reset')}
          </button>
        </div>
      </form>
    </main>
  )
}
// EOF
