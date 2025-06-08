// @file: client/src/app/[locale]/admin/sessions/page.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getGroupedSessions, deleteUserSessions, deleteUserInactiveSessions, deleteAllInactiveSessions } from '@/lib/api/admin/session.api'
import type { GroupedSessionByUserDto } from '@/lib/types/session'
import Paginator from '@/components/ui/Paginator'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/lib/types/table'

const DEFAULT_LIMIT = 10
const ALLOWED_LIMITS = [1, 10, 25, 50, 100]

export default function AdminGroupedSessionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sessions, setSessions] = useState<GroupedSessionByUserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const [filterInput, setFilterInput] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)

  const updateUrlParams = (params: Partial<Record<string, string | number>>) => {
    const q = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (!value) q.delete(key)
      else q.set(key, String(value))
    })
    router.push(`?${q.toString()}`)
  }

  const parseUrlParams = () => {
    const search = searchParams.get('search') || ''
    const rawPage = Number(searchParams.get('page')) || 1
    const rawLimit = Number(searchParams.get('limit')) || DEFAULT_LIMIT
    const sort = searchParams.get('sort') || 'email:asc'

    const safePage = rawPage < 1 ? 1 : rawPage
    const safeLimit = ALLOWED_LIMITS.includes(rawLimit) ? rawLimit : DEFAULT_LIMIT

    if (rawPage < 1 || rawLimit !== safeLimit) {
      updateUrlParams({ page: safePage, limit: safeLimit })
    }

    setPage(safePage)
    setLimit(safeLimit)

    return { search, page: safePage, limit: safeLimit, sort }
  }

  useEffect(() => {
    setLoading(true)
    const { search, page, limit, sort } = parseUrlParams()
    getGroupedSessions({ search, page, limit, sort })
      .then(res => {
        const maxPage = Math.max(1, Math.ceil(res.total / limit))
        if (page > maxPage) updateUrlParams({ page: maxPage })
        else {
          setSessions(res.data || [])
          setTotal(res.total || 0)
        }
      })
      .catch(() => setError('Nie udało się pobrać danych'))
      .finally(() => setLoading(false))
  }, [searchParams])

  const handleSearch = () => {
    updateUrlParams({ search: filterInput.trim(), page: 1 })
  }

  const handleDeleteAll = async (userId: string) => {
    await deleteUserSessions(userId)
    router.refresh()
  }

  const handleDeleteInactive = async (userId: string) => {
    await deleteUserInactiveSessions(userId)
    router.refresh()
  }

  const toggleSort = (field: string) => {
    const [currentField, currentDir] = searchParams.get('sort')?.split(':') || []
    const newDir = currentField === field && currentDir === 'asc' ? 'desc' : 'asc'
    updateUrlParams({ sort: `${field}:${newDir}`, page: 1 })
  }

  const handleDeleteAllInactive = async () => {
    const confirmed = confirm('Czy na pewno chcesz usunąć WSZYSTKIE nieaktywne sesje?')
    if (!confirmed) return

    try {
      await deleteAllInactiveSessions()
      router.refresh()
    } catch {
      alert('Nie udało się usunąć sesji globalnie.')
    }
  }

  const columns: TableColumn<GroupedSessionByUserDto>[] = useMemo(() => [
    {
      label: '#',
      field: 'index',
      render: (_, i) => <span className="font-mono text-gray-500">{(page - 1) * limit + i + 1}</span>,
    },
    { label: 'Email', field: 'email', sortable: true },
    { label: 'Rola', field: 'role', sortable: true },
    { label: 'Sesje', field: 'sessionCount', sortable: true },
    { label: 'Aktywne', field: 'activeSessionCount', sortable: true },
    {
      label: 'Akcje',
      field: 'actions',
      render: (user) => (
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => router.push(`/admin/session/${user.userId}`)} className="px-3 py-1 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 text-white">Szczegóły</button>
          <button onClick={() => handleDeleteInactive(user.userId)} className="px-3 py-1 text-xs font-medium rounded bg-yellow-500 hover:bg-yellow-600 text-white">Usuń nieaktywne</button>
          <button onClick={() => handleDeleteAll(user.userId)} className="px-3 py-1 text-xs font-medium rounded bg-red-600 hover:bg-red-700 text-white">Usuń wszystkie</button>
        </div>
      ),
    },
  ], [page, limit])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white">
        Sesje użytkowników
      </h1>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Szukaj po email..."
          className="w-full max-w-sm px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          value={filterInput}
          onChange={e => setFilterInput(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Szukaj
        </button>
        <button
          onClick={handleDeleteAllInactive}
          className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Usuń wszystkie nieaktywne sesje
        </button>
      </div>


      {loading ? (
        <div className="flex justify-center items-center h-32">
          <span className="text-gray-500 dark:text-gray-300">Ładowanie danych...</span>
        </div>
      ) : error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Brak wyników.</p>
      ) : (
        <>
          <Table
            data={sessions}
            columns={columns}
            rowKey={(row) => row.userId}
            sort={searchParams.get('sort') || ''}
            onSortChange={toggleSort}
          />
          <Paginator
            page={page}
            total={total}
            limit={limit}
            allowedLimits={ALLOWED_LIMITS}
            onPageChange={(newPage) => updateUrlParams({ page: newPage })}
            onLimitChange={(newLimit) => updateUrlParams({ limit: newLimit, page: 1 })}
          />
        </>
      )}
    </div>
  )
}
// EOF
