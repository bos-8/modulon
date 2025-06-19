// @file: src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LogoutButton from '../ui/LogoutBtn';

export default function Navbar() {
  const t = useTranslations('Navbar');
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
          MODULON
        </Link>
        <nav className="flex gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link href="/dashboard" className="hover:text-black dark:hover:text-white">{t('dashboard')}</Link>
          <Link href="/register" className="hover:text-black dark:hover:text-white">{t('signup')}</Link>
          <Link href="/login" className="hover:text-black dark:hover:text-white">{t('login')}</Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
