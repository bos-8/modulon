// @file: client/src/app/[locale]/dashboard/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { getUserDashboard } from '@/lib/api/dashboard.api'
import { Throbber } from '@/components/ui/Throbber'
import { PublicUserAccountDto } from '@modulon/types'
import KeyValueTable from '@/components/ui/KeyValueTable'

export default function DashboardPage() {
  const { data, isPending, isError, error } = useQuery<PublicUserAccountDto>({
    queryKey: ['user', 'dashboard'],
    queryFn: getUserDashboard,
  })

  if (isPending) {
    return (
      <main className="flex items-center justify-center h-[60vh]">
        <Throbber className="w-8 h-8" />
      </main>
    )
  }

  if (isError || !data) {
    return (
      <main className="flex items-center justify-center h-[60vh]">
        <p className="text-red-500">
          Wystąpił błąd podczas ładowania profilu: {error instanceof Error ? error.message : 'Nieznany błąd'}
        </p>
      </main>
    )
  }

  const accountRows = [
    { label: 'Email', content: data.email },
    { label: 'ID', content: data.id },
    { label: 'Nazwa użytkownika', content: data.username ?? '—' },
    { label: 'Nazwa wyświetlana', content: data.name ?? '—' },
    { label: 'Rola', content: data.role },
    { label: 'Ostatnie logowanie', content: data.lastLoginAt ? new Date(data.lastLoginAt).toLocaleString() : '—' },
  ]

  const personal = data.personalData
  const personalRows = [
    { label: 'Imię', content: personal?.firstName ?? '—' },
    { label: 'Drugie imię', content: personal?.middleName ?? '—' },
    { label: 'Nazwisko', content: personal?.lastName ?? '—' },
    { label: 'Telefon', content: personal?.phoneNumber ?? '—' },
    { label: 'Adres', content: personal?.address ?? '—' },
    { label: 'Kod pocztowy', content: personal?.zipCode ?? '—' },
    { label: 'Miasto', content: personal?.city ?? '—' },
    { label: 'Kraj', content: personal?.country ?? '—' },
    { label: 'Data urodzenia', content: personal?.birthDate ? new Date(personal.birthDate).toLocaleDateString() : '—' },
    { label: 'Płeć', content: personal?.gender ?? '—' },
  ]

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Twój profil</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Dane konta</h2>
        <KeyValueTable rows={accountRows} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Dane personalne</h2>
        <KeyValueTable rows={personalRows} />
      </section>
    </main>
  )
}
