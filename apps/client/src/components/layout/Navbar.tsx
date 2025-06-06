// @file: src/components/layout/Navbar.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth/auth.context'
import { useState, useRef, useEffect } from 'react'
import { Envelope, Person } from 'react-bootstrap-icons'
import { usePathname } from 'next/navigation'
import { getMe } from '@/lib/auth/server.auth'
import { adminsOnly } from '@/lib/auth/rbac.presets'
import { castToUserRole } from '@/lib/auth/role.auth'

const NavbarLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname()
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    setIsActive(pathname === href)
  }, [pathname, href])

  return (
    <div className="relative">
      <Link
        href={href}
        className={`inline-block px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${isActive
            ? 'text-black dark:text-white font-semibold'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white'}
        `}
      >
        {label}
      </Link>
      {isActive && (
        <div className="absolute left-0 right-0 bottom-2 h-[2px] bg-green-600 dark:bg-green-400 rounded-full" />
      )}
    </div>
  )
}

export default function Navbar({ isAdmin }: { isAdmin: boolean }) {
  const t = useTranslations('Navbar')
  const { user, logout, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-100">
      <div className="max-w-7xl mx-auto px-4 py-1 flex items-center">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          MODULON
        </Link>

        {/* Separator */}
        <div className="mx-4 h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Navigation Links */}
        <div className="flex gap-4 text-sm font-medium">
          <NavbarLink href="/" label={t('home')} />
          {!loading && isAdmin && (
            <NavbarLink href="/admin/user/list" label="AdminPanel" />
          )}
        </div>

        {/* Spacer */}
        <div className="ml-auto flex items-center gap-4">
          {!loading && user ? (
            <>
              {/* Inbox */}
              <Link href="/inbox" className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
                <Envelope className="w-6 h-6" />
              </Link>
              <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />
              {/* Avatar + Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center focus:outline-none text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  <Person className="w-6 h-6" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 overflow-hidden">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('dashboard')}
                    </Link>

                    <div className="border-t border-gray-200 dark:border-gray-700" />

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/30 transition-colors"
                    >
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>

            </>
          ) : (
            <>
              <NavbarLink href="/register" label={t('signup')} />
              <NavbarLink href="/login" label={t('login')} />
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
// EOF
