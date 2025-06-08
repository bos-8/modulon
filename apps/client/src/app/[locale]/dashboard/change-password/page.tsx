// @file: client/src/app/[locale]/dashboard/change-password/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema, ChangePasswordFormData } from './changePassword.schema'
import { changeUserPassword } from '@/lib/api/user/dashboard.api'
import { useState } from 'react'

export default function ChangePasswordPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (values: ChangePasswordFormData) => {
    try {
      await changeUserPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      setSuccess(true)
      setError(null)
      reset()
    } catch (err: any) {
      setError('Błąd podczas zmiany hasła. Upewnij się, że obecne hasło jest poprawne.')
      setSuccess(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto px-6 pt-20 pb-12">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Zmień hasło</h1>

      {success && (
        <div className="alert alert-success mb-4">Hasło zostało zmienione.</div>
      )}
      {error && (
        <div className="alert alert-error mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Obecne hasło</label>
          <input
            type="password"
            className="input input-bordered w-full"
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Nowe hasło</label>
          <input
            type="password"
            className="input input-bordered w-full"
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Powtórz nowe hasło</label>
          <input
            type="password"
            className="input input-bordered w-full"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          Zapisz nowe hasło
        </button>
      </form>
    </main>
  )
}
// EOF
