// @file: client/src/app/[locale]/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Throbber } from '@/components/ui/Throbber'
import { fetchUserDashboard, updateUserDashboard } from '@/lib/api/user/dashboard.api'
import type { UserDashboardData } from '@/lib/types/dashboard'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/lib/types/table'
import { Gender } from '@/lib/types/user'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [data, setData] = useState<UserDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchUserDashboard()
        setData(result)
        setFormData({
          username: result.username ?? '',
          name: result.name ?? '',
          firstName: result.personalData.firstName ?? '',
          middleName: result.personalData.middleName ?? '',
          lastName: result.personalData.lastName ?? '',
          phoneNumber: result.personalData.phoneNumber ?? '',
          address: result.personalData.address ?? '',
          city: result.personalData.city ?? '',
          zipCode: result.personalData.zipCode ?? '',
          country: result.personalData.country ?? '',
          birthDate: result.personalData.birthDate?.split('T')[0] ?? '',
          gender: result.personalData.gender ?? '',
        })
      } catch {
        setError('Wystąpił błąd podczas ładowania danych profilu.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <main className="flex items-center justify-center h-[60vh]">
        <Throbber className="w-8 h-8" />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex items-center justify-center h-[60vh]">
        <p className="text-red-500">{error ?? 'Wystąpił błąd'}</p>
      </main>
    )
  }

  const renderValue = (field: string) => {
    if (!isEditing) return formData[field] || '—'

    if (field === 'gender') {
      return (
        <select
          className="select select-sm select-bordered w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
          value={formData[field] ?? ''}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
        >
          <option value="">—</option>
          <option value={Gender.MALE}>Mężczyzna</option>
          <option value={Gender.FEMALE}>Kobieta</option>
          <option value={Gender.OTHER}>Inna</option>
        </select>
      )
    }

    if (field === 'birthDate') {
      return (
        <input
          type="date"
          className="input input-sm input-bordered w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
          value={formData[field] ?? ''}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
        />
      )
    }

    return (
      <input
        type="text"
        className="input input-sm input-bordered w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
        value={formData[field] ?? ''}
        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
      />
    )
  }


  const genderOptions = [
    { value: '', label: '—' },
    { value: Gender.MALE, label: 'Mężczyzna' },
    { value: Gender.FEMALE, label: 'Kobieta' },
    { value: Gender.OTHER, label: 'Inna' },
  ]

  const tableData = [
    { key: 'email', label: 'Email', value: data.email, editable: false },
    { key: 'id', label: 'ID', value: data.id, editable: false },
    { key: 'role', label: 'Rola', value: data.role, editable: false },
    { key: 'username', label: 'Nazwa użytkownika', editable: true },
    { key: 'name', label: 'Nazwa wyświetlana', editable: true },
    { key: 'firstName', label: 'Imię', editable: true },
    { key: 'middleName', label: 'Drugie imię', editable: true },
    { key: 'lastName', label: 'Nazwisko', editable: true },
    { key: 'phoneNumber', label: 'Telefon', editable: true },
    { key: 'address', label: 'Adres', editable: true },
    { key: 'zipCode', label: 'Kod pocztowy', editable: true },
    { key: 'city', label: 'Miasto', editable: true },
    { key: 'country', label: 'Kraj', editable: true },
    { key: 'birthDate', label: 'Data urodzenia', editable: true },
    { key: 'gender', label: 'Płeć', editable: true },
  ]

  const columns: TableColumn<typeof tableData[0]>[] = [
    {
      field: 'label',
      label: 'Pole',
      sortable: false,
    },
    {
      field: 'value',
      label: isEditing ? 'Wartość (edytowalna)' : 'Wartość',
      sortable: false,
      render: (row) =>
        row.editable ? renderValue(row.key) : row.value || '—',
    },
  ]

  return (
    <main className="flex flex-col items-center justify-start px-6 pt-20 pb-12 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Twój profil
          </h1>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={async () => {
                    try {
                      await updateUserDashboard({
                        username: formData.username,
                        name: formData.name,
                        personalData: {
                          firstName: formData.firstName,
                          middleName: formData.middleName,
                          lastName: formData.lastName,
                          phoneNumber: formData.phoneNumber,
                          address: formData.address,
                          city: formData.city,
                          zipCode: formData.zipCode,
                          country: formData.country,
                          birthDate: formData.birthDate || null,
                          gender: formData.gender as Gender || null,
                        }
                      })
                      const refreshed = await fetchUserDashboard()
                      setData(refreshed)
                      setFormData({
                        username: refreshed.username ?? '',
                        name: refreshed.name ?? '',
                        firstName: refreshed.personalData.firstName ?? '',
                        middleName: refreshed.personalData.middleName ?? '',
                        lastName: refreshed.personalData.lastName ?? '',
                        phoneNumber: refreshed.personalData.phoneNumber ?? '',
                        address: refreshed.personalData.address ?? '',
                        city: refreshed.personalData.city ?? '',
                        zipCode: refreshed.personalData.zipCode ?? '',
                        country: refreshed.personalData.country ?? '',
                        birthDate: refreshed.personalData.birthDate?.split('T')[0] ?? '',
                        gender: refreshed.personalData.gender ?? '',
                      })
                      setIsEditing(false)
                    } catch (err) {
                      console.error('Błąd podczas zapisu danych:', err)
                      alert('Wystąpił błąd podczas zapisu zmian.')
                    }
                  }}
                >
                  Zapisz
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    // Przywróć oryginalne dane z `data`
                    if (data) {
                      setFormData({
                        username: data.username ?? '',
                        name: data.name ?? '',
                        firstName: data.personalData.firstName ?? '',
                        middleName: data.personalData.middleName ?? '',
                        lastName: data.personalData.lastName ?? '',
                        phoneNumber: data.personalData.phoneNumber ?? '',
                        address: data.personalData.address ?? '',
                        city: data.personalData.city ?? '',
                        zipCode: data.personalData.zipCode ?? '',
                        country: data.personalData.country ?? '',
                        birthDate: data.personalData.birthDate?.split('T')[0] ?? '',
                        gender: data.personalData.gender ?? '',
                      })
                    }
                    setIsEditing(false)
                  }}
                >
                  Anuluj
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edytuj dane
                </button>
                <button
                  className="btn btn-sm btn-primary"

                  onClick={() => {
                    router.push('/dashboard/change-password')
                  }}
                >
                  Zmień hasło
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Tutaj możesz zobaczyć lub edytować swoje dane osobowe.
        </p>

        <Table
          data={tableData}
          columns={columns}
          rowKey={(row) => row.key}
        />
      </div>
    </main>
  )
}
// EOF
