// @file: client/src/app/[locale]/admin/user/edit/[id]/page.tsx

'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userEditFormSchema, UserEditFormData } from '../../userForm.schema'
import { fetchUserById, updateUser } from '@/lib/api/admin/user.api'
import { UserRole, PersonalDataDto, UserWithPersonalDataDto, UpdateUserDto } from '@/lib/types/user'
import KeyValueTable from '@/components/ui/KeyValueTable'
import { Throbber } from '@/components/ui/Throbber'

export default function AdminUserEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [user, setUser] = useState<UserWithPersonalDataDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditFormSchema),
  })

  useEffect(() => {
    if (!id) return

    const loadUser = async () => {
      try {
        const data = await fetchUserById(id)
        setUser(data)

        form.reset({
          username: data.user.username,
          name: data.user.name,
          role: data.user.role,
          isActive: data.user.isActive,
          isBlocked: data.user.isBlocked,
          isEmailConfirmed: data.user.isEmailConfirmed,
          password: '',
          confirmPassword: '',
          ...(data.personalData ?? {}),
        })
      } catch {
        setErrorMessage('Nie udało się załadować użytkownika.')
      } finally {
        setLoading(false)
      }
    }

    void loadUser()
  }, [id])

  const handleReset = () => {
    if (!user) return
    const { user: u, personalData: p } = user
    form.reset({
      username: u.username,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      isBlocked: u.isBlocked,
      isEmailConfirmed: u.isEmailConfirmed,
      password: '',
      confirmPassword: '',
      ...(p ?? {}),
    })
  }

  const onSubmit = async (data: UserEditFormData) => {
    try {
      const { confirmPassword, ...rest } = data
      const {
        firstName, middleName, lastName, gender, birthDate,
        phoneNumber, address, city, zipCode, country,
        ...userFields
      } = rest

      const payload = {
        ...userFields,
        personalData: {
          firstName,
          middleName,
          lastName,
          gender,
          birthDate,
          phoneNumber,
          address,
          city,
          zipCode,
          country,
        }
      }

      await updateUser(id, payload)

      // ✨ Reload saved state
      const refreshed = await fetchUserById(id)
      setUser(refreshed)
      form.reset({
        username: refreshed.user.username,
        name: refreshed.user.name,
        role: refreshed.user.role,
        isActive: refreshed.user.isActive,
        isBlocked: refreshed.user.isBlocked,
        isEmailConfirmed: refreshed.user.isEmailConfirmed,
        password: '',
        confirmPassword: '',
        ...(refreshed.personalData ?? {}),
      })

      setSuccessMessage('Zaktualizowano użytkownika.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Błąd podczas aktualizacji użytkownika.'
      setErrorMessage(msg)
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }


  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Edycja konta użytkownika</h1>
        <button onClick={() => router.back()} className="btn btn-sm btn-outline">⬅ Wróć</button>
      </div>

      {successMessage && <div className="alert alert-success shadow-sm"><span>{successMessage}</span></div>}
      {errorMessage && <div className="alert alert-error shadow-sm"><span>{errorMessage}</span></div>}

      {loading || !user ? (
        <Throbber />
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              const tag = (e.target as HTMLElement).tagName
              if (tag === 'INPUT' || tag === 'SELECT') {
                e.preventDefault()
                form.handleSubmit(onSubmit)()
              }
            }
          }}
          className="space-y-6"
        >

          <section>
            <h2 className="text-sm font-semibold text-base-content/70 mb-2">DANE KONTA</h2>
            <KeyValueTable
              rows={[
                { label: 'UUID', content: user.user.id },
                { label: 'Email', content: user.user.email },
                { label: 'Username', content: <input {...form.register('username')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
                { label: 'Imię', content: <input {...form.register('name')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
                {
                  label: 'Rola',
                  content: (
                    <select {...form.register('role')} className="select select-sm select-bordered w-full">
                      {Object.values(UserRole).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ),
                },
                {
                  label: 'Aktywny',
                  content: <input type="checkbox" {...form.register('isActive')} className="toggle toggle-sm" />,
                },
                {
                  label: 'Zablokowany',
                  content: <input type="checkbox" {...form.register('isBlocked')} className="toggle toggle-sm" />,
                },
                {
                  label: 'Email potwierdzony',
                  content: <input type="checkbox" {...form.register('isEmailConfirmed')} className="toggle toggle-sm" />,
                },
              ]}
            />
          </section>



          <section>
            <h2 className="text-sm font-semibold text-base-content/70 mb-2">DANE PERSONALNE</h2>
            <KeyValueTable
              rows={[
                { label: 'Imię', content: <input {...form.register('firstName')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
                { label: 'Drugie imię', content: <input {...form.register('middleName')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
                { label: 'Nazwisko', content: <input {...form.register('lastName')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
                {
                  label: 'Płeć',
                  content: (
                    <select {...form.register('gender')} className="select select-sm select-bordered w-full">
                      <option value="">– wybierz –</option>
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  ),
                },
                {
                  label: 'Data urodzenia',
                  content: <input type="date" {...form.register('birthDate')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" />,
                },
              ]}
            />
          </section>

          <section>
            <h2 className="text-sm font-semibold text-base-content/70 mb-2">DANE KONTAKTOWE</h2>
            <KeyValueTable
              rows={[
                { label: 'Telefon', content: <input {...form.register('phoneNumber')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
                { label: 'Adres', content: <input {...form.register('address')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
                { label: 'Miasto', content: <input {...form.register('city')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
                { label: 'Kod pocztowy', content: <input {...form.register('zipCode')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
                { label: 'Kraj', content: <input {...form.register('country')} className="input w-full bg-base-100 text-base-content border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-primary/30 focus:border-primary" /> },
              ]}
            />
          </section>


          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleReset} className="btn btn-outline btn-sm">Reset</button>
            <button type="submit" className="btn btn-success btn-sm">Zapisz zmiany</button>
          </div>
        </form>
      )}
    </div>
  )
}
// EOF
