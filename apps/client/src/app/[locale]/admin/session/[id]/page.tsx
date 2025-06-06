'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { getSessions, deleteSession } from '@/lib/api/admin/session.api'
import type { SessionDto } from '@/lib/types/session'

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
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('ip')}>
                    IP {sort.startsWith('ip') && (sort.endsWith('asc') ? '▲' : '▼')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('deviceInfo')}>
                    Urządzenie {sort.startsWith('deviceInfo') && (sort.endsWith('asc') ? '▲' : '▼')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('createdAt')}>
                    Utworzono {sort.startsWith('createdAt') && (sort.endsWith('asc') ? '▲' : '▼')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('expires')}>
                    Wygasa {sort.startsWith('expires') && (sort.endsWith('asc') ? '▲' : '▼')}
                  </th>
                  <th className="px-4 py-3">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sessions.map((sess, index) => (
                  <tr key={sess.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {sess.ip || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {sess.deviceInfo || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {new Date(sess.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {new Date(sess.expires).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDelete(sess.id)}
                      >
                        Usuń
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {/* PAGINATION + LIMIT */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Strona {page} z {totalPages}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm text-gray-600 dark:text-gray-400">Na stronę:</label>
              <select
                className="px-2 py-1 border-none focus:outline-none rounded bg-white dark:bg-gray-800 text-sm"
                value={limit}
                onChange={(e) => updateUrlParams({ limit: Number(e.target.value), page: 1 })}
              >
                {ALLOWED_LIMITS.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>

              <button
                disabled={page === 1}
                onClick={() => updateUrlParams({ page: 1 })}
                className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                First
              </button>

              <button
                disabled={page === 1}
                onClick={() => updateUrlParams({ page: page - 1 })}
                className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                ←
              </button>

              {Array.from({ length: 5 }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const p = start + i
                if (p > totalPages) return null

                const isCurrent = p === page

                return isCurrent ? (
                  <input
                    key="input"
                    type="number"
                    min={1}
                    max={totalPages}
                    value={page}
                    className="w-16 px-3 py-1 text-sm text-center bg-blue-600 text-white rounded outline-none border-0 ring-2 ring-blue-500 focus:ring-blue-400
    [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none
    [appearance:textfield]"
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (!isNaN(val)) updateUrlParams({ page: val })
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = Number((e.target as HTMLInputElement).value)
                        if (!isNaN(val) && val >= 1 && val <= totalPages) {
                          updateUrlParams({ page: val })
                        }
                      }
                    }}
                  />

                ) : (
                  <button
                    key={p}
                    onClick={() => updateUrlParams({ page: p })}
                    className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  >
                    {p}
                  </button>
                )
              })}

              <button
                disabled={page === totalPages}
                onClick={() => updateUrlParams({ page: page + 1 })}
                className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                →
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => updateUrlParams({ page: totalPages })}
                className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>


        </>
      )}
    </div>
  )
}
// EOF
