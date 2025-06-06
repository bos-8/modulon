// @file: client/src/app/[locale]/admin/user/edit/[id]/page.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userEditFormSchema, UserEditFormData } from '../../userForm.schema'
import { fetchUserById, updateUser } from '@/lib/api/admin/user.api'
import { UserDto, UpdateUserDto, UserRole } from '@/lib/types/user'

export default function AdminUserEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditFormSchema),
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserById(id)
        setUser(data)
        form.reset({
          username: data.username,
          name: data.name,
          role: data.role,
          isActive: data.isActive,
          isBlocked: data.isBlocked,
          isEmailConfirmed: data.isEmailConfirmed,
          password: '',
          confirmPassword: '',
        })
      } catch (err) {
        setErrorMessage('Nie udało się załadować użytkownika.')
      } finally {
        setLoading(false)
      }
    }

    if (id) loadUser()
  }, [id, form])

  const onSubmit = async (data: UserEditFormData) => {
    try {
      const { confirmPassword, ...dto } = data
      await updateUser(id, dto as UpdateUserDto)
      setSuccessMessage('Zaktualizowano użytkownika.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Błąd podczas aktualizacji użytkownika.'
      setErrorMessage(msg)
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Edycja użytkownika</h1>
        <button onClick={() => router.back()} className="btn btn-sm btn-outline">
          ⬅ Wróć
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success shadow-sm mb-4">
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error shadow-sm mb-4">
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div>Ładowanie użytkownika...</div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label label-text">Username</label>
            <input {...form.register('username')} className="input input-sm input-bordered w-full" />
            {form.formState.errors.username && (
              <p className="text-xs text-error mt-1">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="label label-text">Imię</label>
            <input {...form.register('name')} className="input input-sm input-bordered w-full" />
            {form.formState.errors.name && (
              <p className="text-xs text-error mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label label-text">Rola</label>
            <select {...form.register('role')} className="select select-sm select-bordered w-full">
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label label-text">Status</label>
            <input type="checkbox" {...form.register('isActive')} className="toggle toggle-sm mt-1" />
            <span className="ml-2 text-sm">Aktywny</span>
          </div>

          <div>
            <label className="label label-text">Zablokowany</label>
            <input type="checkbox" {...form.register('isBlocked')} className="toggle toggle-sm mt-1" />
          </div>

          <div>
            <label className="label label-text">Email potwierdzony</label>
            <input type="checkbox" {...form.register('isEmailConfirmed')} className="toggle toggle-sm mt-1" />
          </div>

          <div>
            <label className="label label-text">Nowe hasło</label>
            <input type="password" {...form.register('password')} className="input input-sm input-bordered w-full" />
          </div>

          <div>
            <label className="label label-text">Powtórz hasło</label>
            <input
              type="password"
              {...form.register('confirmPassword')}
              className="input input-sm input-bordered w-full"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-error mt-1">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2">
            <button type="submit" className="btn btn-success btn-sm w-full sm:w-auto">
              Zapisz zmiany
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
// EOF
