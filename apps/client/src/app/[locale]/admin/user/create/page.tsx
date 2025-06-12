// @file: client/src/app/[locale]/admin/user/create/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { createUser } from '@/lib/api/admin/user.api'
import { userFormSchema, UserFormData } from '../userForm.schema'
import { UserRole } from '@/lib/types/user'
import KeyValueTable from '@/components/ui/KeyValueTable'

export default function AdminUserCreatePage() {
  const router = useRouter()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<UserFormData>({
    defaultValues: {
      email: '',
      username: '',
      name: '',
      password: '',
      confirmPassword: '',
      role: UserRole.USER, // jawnie
    }
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form



  const onSubmit = async (data: UserFormData) => {
    try {
      const { confirmPassword, ...dto } = data
      const res = await createUser(dto)
      const msg = res.message || 'Użytkownik został utworzony.'
      setSuccessMessage(msg)
      reset()

      window.alert(msg)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('[CREATE_USER_ERROR]', err)

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Wystąpił błąd podczas tworzenia użytkownika'

      setErrorMessage(message)
      window.alert('Błąd: ' + message)
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Nowy użytkownik</h1>
        <button onClick={() => router.back()} className="btn btn-sm btn-outline">
          ⬅ Wróć
        </button>
      </div>

      <p className="text-sm text-base-content/70">
        Wypełnij poniższy formularz, aby utworzyć nowe konto użytkownika.
      </p>

      {successMessage && (
        <div className="alert alert-success shadow-sm">
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-error shadow-sm">
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <KeyValueTable
          rows={[
            {
              label: 'Email',
              content: (
                <>
                  <input {...register('email')} className="input input-sm input-bordered w-full" />
                  {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                </>
              ),
            },
            {
              label: 'Imię',
              content: (
                <>
                  <input {...register('name')} className="input input-sm input-bordered w-full" />
                  {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                </>
              ),
            },
            {
              label: 'Username',
              content: (
                <>
                  <input {...register('username')} className="input input-sm input-bordered w-full" />
                  {errors.username && <p className="text-xs text-error mt-1">{errors.username.message}</p>}
                </>
              ),
            },
            {
              label: 'Rola',
              content: (
                <select {...register('role')} className="select select-sm select-bordered w-full">
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              ),
            },
            {
              label: 'Hasło',
              content: (
                <>
                  <input type="password" {...register('password')} className="input input-sm input-bordered w-full" />
                  {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
                </>
              ),
            },
            {
              label: 'Powtórz hasło',
              content: (
                <>
                  <input type="password" {...register('confirmPassword')} className="input input-sm input-bordered w-full" />
                  {errors.confirmPassword && <p className="text-xs text-error mt-1">{errors.confirmPassword.message}</p>}
                </>
              ),
            },
          ]}
        />

        <div className="flex justify-end gap-4">
          <button type="submit" className="btn btn-success btn-sm">
            Utwórz użytkownika
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => reset()}
          >
            Resetuj formularz
          </button>
        </div>
      </form>
    </div>
  )
}
// EOF