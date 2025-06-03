// @file: src/app/[locale]/dashboard/page.tsx
'use client'

import { useTranslations } from 'next-intl'
import { useUser, useAuthLoading } from '@/lib/auth/auth.context'
import { Throbber } from '@/components/ui/Throbber'

export default function DashboardPage() {
  // const t = useTranslations('InboxPage')
  const user = useUser()
  const loading = useAuthLoading()

  if (loading) {
    return (
      <main className="flex items-center justify-center h-[60vh]">
        <Throbber className="w-8 h-8" />
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-start px-6 pt-20 pb-12 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          INBOX - TODO
        </h1>
      </div>
    </main>
  )
}
// EOF
