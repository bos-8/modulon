// @file: src/components/layout/Navbar.tsx
'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth/auth.context'

export default function Navbar() {
  const t = useTranslations('Navbar')
  const { user, logout, loading } = useAuth()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
          MODULON
        </Link>

        <div className="flex gap-4 text-sm font-medium text-gray-600 dark:text-gray-300 items-center">
          <Link href="/" className="hover:text-black dark:hover:text-white">{t('home')}</Link>
          <Link href="/dashboard" className="hover:text-black dark:hover:text-white">{t('dashboard')}</Link>
          <Link href="/register" className="hover:text-black dark:hover:text-white">{t('signup')}</Link>
          <Link href="/login" className="hover:text-black dark:hover:text-white">{t('login')}</Link>

          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition"
          >
            {t('logout')}
          </button>

        </div>
      </div>
    </nav>
  )
}
// EOF
