'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchUsersPaginated, deleteUser } from '@/lib/api/admin/user.api'
import { UserDto } from '@/lib/types/user'
import { Throbber } from '@/components/ui/Throbber'
import {
  ArrowDown,
  ArrowUp,
  Check2,
  DashLg,
  Pencil,
  PersonAdd,
  Trash,
  XLg
} from 'react-bootstrap-icons'

const DEFAULT_LIMIT = 10
const LIMIT_OPTIONS = [1, 10, 25, 50, 100]
const FILTER_FIELDS = ['search', 'email', 'username', 'role']

export default function AdminUserListPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [users, setUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const page = parseInt(searchParams.get('page') || '1', 10)
  const rawLimit = parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10)
  const limit = LIMIT_OPTIONS.includes(rawLimit) ? rawLimit : DEFAULT_LIMIT
  const sort = searchParams.get('sort') || 'createdAt:desc'
  const [sortField, sortDir] = sort.split(':')

  const [filterMode, setFilterMode] = useState<'basic' | 'advanced'>('basic')
  const [filterValues, setFilterValues] = useState({
    search: searchParams.get('search') || '',
    email: searchParams.get('email') || '',
    username: searchParams.get('username') || '',
    role: searchParams.get('role') || '',
  })

  const updateSearchParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams)
    FILTER_FIELDS.forEach((key) => params.delete(key))
    params.set('page', '1')
    router.push(`?${params.toString()}`)
    setFilterValues({ search: '', email: '', username: '', role: '' })
  }

  const toggleSort = (field: string) => {
    const next = sortField === field && sortDir === 'asc' ? 'desc' : 'asc'
    updateSearchParams({ sort: `${field}:${next}` })
  }

  const renderSortIcon = (field: string) =>
    sortField !== field ? null : sortDir === 'asc' ? <ArrowUp className="inline ml-1" /> : <ArrowDown className="inline ml-1" />

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchUsersPaginated({
          page,
          limit,
          sort,
          ...filterValues,
        })

        if (res.totalPages === 0 && page !== 1) {
          router.replace(`?page=1&limit=${limit}&sort=${sort}`)
          return
        }
        if (res.totalPages > 0 && page > res.totalPages) {
          router.replace(`?page=${res.totalPages}&limit=${limit}&sort=${sort}`)
          return
        }

        setUsers(res.data)
        setTotalUsers(res.total)
        setTotalPages(res.totalPages)
      } catch (err) {
        console.error('[FETCH_USERS_ERROR]', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, limit, sort, searchParams.toString()])

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return
    try {
      setDeletingId(id)
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error('[DELETE_USER_ERROR]', err)
    } finally {
      setDeletingId(null)
    }
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Zarządzanie użytkownikami</h1>
        <Link href="/admin/user/create" className="btn btn-sm btn-primary">
          <PersonAdd className="w-4 h-4 mr-1" /> Dodaj użytkownika
        </Link>
      </div>

      {/* Filtry */}
      <div className="bg-base-100 border p-4 rounded-md shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Filtrowanie użytkowników</h2>
          <button onClick={() => setFilterMode((m) => (m === 'basic' ? 'advanced' : 'basic'))} className="btn btn-xs btn-outline">
            {filterMode === 'basic' ? 'Zaawansowane' : 'Proste'} filtry
          </button>
        </div>

        {filterMode === 'basic' ? (
          <input
            type="search"
            className="input input-sm input-bordered w-full"
            placeholder="Szukaj globalnie (email, username, imię)..."
            value={filterValues.search}
            onChange={(e) => setFilterValues((f) => ({ ...f, search: e.target.value }))}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              className="input input-sm input-bordered"
              placeholder="Email"
              value={filterValues.email}
              onChange={(e) => setFilterValues((f) => ({ ...f, email: e.target.value }))}
            />
            <input
              type="text"
              className="input input-sm input-bordered"
              placeholder="Username"
              value={filterValues.username}
              onChange={(e) => setFilterValues((f) => ({ ...f, username: e.target.value }))}
            />
            <select
              className="select select-sm select-bordered"
              value={filterValues.role}
              onChange={(e) => setFilterValues((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="">– dowolna rola –</option>
              <option value="USER">USER</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={() => updateSearchParams(filterValues)} className="btn btn-sm btn-primary">
            Filtruj
          </button>
          <button onClick={resetFilters} className="btn btn-sm btn-outline">
            Resetuj
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="table w-full text-sm">
          <thead className="bg-base-200 text-xs uppercase">
            <tr>
              <th>#</th>
              <th onClick={() => toggleSort('email')} className="cursor-pointer">Email {renderSortIcon('email')}</th>
              <th onClick={() => toggleSort('username')} className="cursor-pointer">Username {renderSortIcon('username')}</th>
              <th onClick={() => toggleSort('name')} className="cursor-pointer">Imię {renderSortIcon('name')}</th>
              <th onClick={() => toggleSort('role')} className="cursor-pointer">Rola {renderSortIcon('role')}</th>
              <th>Status</th>
              <th>Email</th>
              <th onClick={() => toggleSort('createdAt')} className="cursor-pointer">Utworzono {renderSortIcon('createdAt')}</th>
              <th onClick={() => toggleSort('lastLoginAt')} className="cursor-pointer">Ostatnie logowanie {renderSortIcon('lastLoginAt')}</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center p-4">
                  <Throbber />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center p-4 text-base-content/60">
                  Brak wyników.
                </td>
              </tr>
            ) : (
              users.map((user, i) => (
                <tr key={user.id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{user.name || '-'}</td>
                  <td>{user.role}</td>
                  <td className="text-center">
                    {user.isActive && !user.isBlocked ? <Check2 className="text-green-500" /> : <XLg className="text-red-500" />}
                  </td>
                  <td className="text-center">
                    {user.isEmailConfirmed ? <Check2 className="text-green-500" /> : <XLg className="text-red-500" />}
                  </td>
                  <td className="text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="text-xs">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : <DashLg className="text-gray-400" />}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/user/edit/${user.id}`} className="btn btn-xs btn-outline">
                        <Pencil className="inline mr-1" />
                        Edytuj
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn btn-xs btn-outline btn-error"
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? <Throbber /> : (<><Trash className="inline mr-1" />Usuń</>)}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacja */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Wierszy na stronę:</label>
          <select
            className="select select-sm select-bordered"
            value={limit}
            onChange={(e) => updateSearchParams({ limit: e.target.value })}
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="join">
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => updateSearchParams({ page: p.toString() })}
              className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
// EOF
