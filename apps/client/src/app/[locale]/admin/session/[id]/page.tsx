'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { getSessions, deleteSession } from '@/lib/api/admin/session.api'
import type { SessionDto } from '@/lib/types/session'
import Paginator from '@/components/ui/Paginator'
import type { TableColumn } from '@/lib/types/table'
import Table from '@/components/ui/Table'

const DEFAULT_LIMIT = 10
const ALLOWED_LIMITS = [3, 10, 20, 50, 100]

export default function AdminUserSessionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { id: userId } = useParams<{ id: string }>()

  const [sessions, setSessions] = useState<SessionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterInput, setFilterInput] = useState(searchParams.get('search') || '')
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState('createdAt:desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [total, setTotal] = useState(0)

  const updateUrlParams = (params: Partial<Record<string, string | number>>) => {
    const q = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) {
        q.delete(key)
      } else {
        q.set(key, String(value))
      }
    })
    router.push(`?${q.toString()}`)
  }

  const parseUrlParams = () => {
    const search = searchParams.get('search') || ''
    const rawSort = searchParams.get('sort') || 'createdAt:desc'
    const rawPage = Number(searchParams.get('page')) || 1
    const rawLimit = Number(searchParams.get('limit')) || DEFAULT_LIMIT

    const safePage = Math.max(1, rawPage)
    const safeLimit = ALLOWED_LIMITS.includes(rawLimit) ? rawLimit : DEFAULT_LIMIT

    if (rawPage < 1 || rawLimit !== safeLimit) {
      updateUrlParams({ page: safePage, limit: safeLimit })
    }

    setFilter(search)
    setSort(rawSort)
    setPage(safePage)
    setLimit(safeLimit)

    return { search, sort: rawSort, page: safePage, limit: safeLimit }
  }

  useEffect(() => {
    if (!userId) return
    const { search, sort, page: safePage, limit: safeLimit } = parseUrlParams()

    setLoading(true)
    getSessions({ search, sort, page: safePage, limit: safeLimit, userId })
      .then(res => {
        const maxPage = Math.max(1, Math.ceil(res.total / safeLimit))
        if (safePage > maxPage) {
          updateUrlParams({ page: maxPage })
        } else {
          setSessions(res.data || [])
          setTotal(res.total || 0)
        }
      })
      .catch(() => setError('Nie udało się pobrać sesji'))
      .finally(() => setLoading(false))
  }, [searchParams.toString(), userId])

  const userEmail = sessions.length > 0
    ? (sessions[0].user?.email ?? 'Nieznany użytkownik')
    : 'Nieznany użytkownik'

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const toggleSort = (field: string) => {
    const [currentField, currentDir] = sort.split(':')
    const newDir = currentField === field && currentDir === 'asc' ? 'desc' : 'asc'
    updateUrlParams({ sort: `${field}:${newDir}`, page: 1 })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id)
      setSessions(prev => prev.filter(sess => sess.id !== id))
    } catch {
      alert('Nie udało się usunąć sesji.')
    }
  }

  const handleSearch = () => {
    updateUrlParams({ search: filterInput.trim(), page: 1 })
  }

  const columns: TableColumn<SessionDto>[] = useMemo(() => [
    {
      label: '#',
      field: 'index',
      render: (_, i) => (
        <span className="font-mono text-gray-500">
          {(page - 1) * limit + i + 1}
        </span>
      ),
    },
    {
      label: 'IP',
      field: 'ip',
      sortable: true,
      render: (row) => <span>{row.ip || '—'}</span>,
    },
    {
      label: 'Urządzenie',
      field: 'deviceInfo',
      sortable: true,
      render: (row) => <span>{row.deviceInfo || '—'}</span>,
    },
    {
      label: 'Utworzono',
      field: 'createdAt',
      sortable: true,
      render: (row) => <span>{new Date(row.createdAt).toLocaleString()}</span>,
    },
    {
      label: 'Wygasa',
      field: 'expires',
      sortable: true,
      render: (row) => <span>{new Date(row.expires).toLocaleString()}</span>,
    },
    {
      label: 'Akcje',
      field: 'actions',
      render: (row) => (
        <button
          className="inline-flex items-center px-3 py-1 text-xs font-medium rounded bg-red-600 hover:bg-red-700 text-white"
          onClick={() => handleDelete(row.id)}
        >
          Usuń
        </button>
      ),
    },
  ], [page, limit])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/admin/session')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Wróć do listy sesji
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Sesje użytkownika: <span className="text-blue-600 dark:text-blue-400">{userEmail}</span>
        </h1>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="Szukaj po IP lub urządzeniu..."
            className="w-full max-w-sm px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
          />
          <button
            onClick={() => updateUrlParams({ search: filterInput.trim(), page: 1 })}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Filtruj
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-600 dark:text-gray-300">Ładowanie danych...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {!loading && sessions.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Brak aktywnych sesji.</p>
      )}

      {!loading && sessions.length > 0 && (
        <>
          <Table
            data={sessions}
            columns={columns}
            rowKey={(row) => row.id}
            sort={sort}
            onSortChange={toggleSort}
          />

          <Paginator
            page={page}
            total={total}
            limit={limit}
            allowedLimits={ALLOWED_LIMITS}
            onPageChange={(newPage) => updateUrlParams({ page: newPage })}
            onLimitChange={(newLimit) => updateUrlParams({ limit: newLimit, page: 1 })} />
        </>
      )}
    </div>
  )
}
// EOF
