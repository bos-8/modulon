// @file: src/app/[locale]/dashboard/page.tsx
'use client'

import { useTranslations } from 'next-intl'
import { useUser, useAuthLoading } from '@/lib/auth/auth.context'
import { Throbber } from '@/components/ui/Throbber'

export default function DashboardPage() {
  const t = useTranslations('DashboardPage')
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
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
          {t('description')}
        </p>
        {user && (
          <table className="w-full mt-4 text-sm text-left text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th scope="row" className="py-3 pr-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {t('emailLabel')}
                </th>
                <td className="py-3">{user.email}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th scope="row" className="py-3 pr-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {t('idLabel')}
                </th>
                <td className="py-3">{user.id}</td>
              </tr>
              <tr>
                <th scope="row" className="py-3 pr-6 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {t('roleLabel')}
                </th>
                <td className="py-3">{user.role}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
// EOF
