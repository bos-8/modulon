'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchUsersPaginated, deleteUser } from '@/lib/api/admin/user.api'
import { UserDto } from '@/lib/types/user'
import Table from '@/components/ui/Table'
import Paginator from '@/components/ui/Paginator'
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

        setUsers(res.data)
        setTotalUsers(res.total)
      } catch (err) {
        console.error('[FETCH_USERS_ERROR]', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, limit, sort, searchParams.toString()])

  const columns = [
    {
      field: 'index',
      label: '#',
      render: (_: any, i: number) => (page - 1) * limit + i + 1,
    },
    { field: 'email', label: 'Email', sortable: true },
    { field: 'username', label: 'Username', sortable: true },
    {
      field: 'name',
      label: 'Imię',
      sortable: true,
      render: (row: UserDto) => row.name || '-',
    },
    { field: 'role', label: 'Rola', sortable: true },
    {
      field: 'isActive',
      label: 'Status',
      render: (row: UserDto) =>
        row.isActive && !row.isBlocked ? <Check2 className="text-green-500" /> : <XLg className="text-red-500" />,
    },
    {
      field: 'isEmailConfirmed',
      label: 'Email',
      render: (row: UserDto) =>
        row.isEmailConfirmed ? <Check2 className="text-green-500" /> : <XLg className="text-red-500" />,
    },
    {
      field: 'createdAt',
      label: 'Utworzono',
      sortable: true,
      render: (row: UserDto) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      field: 'lastLoginAt',
      label: 'Ostatnie logowanie',
      sortable: true,
      render: (row: UserDto) =>
        row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : <DashLg className="text-gray-400" />,
    },
    {
      field: 'actions',
      label: 'Akcje',
      render: (row: UserDto) => (
        <div className="flex gap-2">
          <Link href={`/admin/user/edit/${row.id}`} className="btn btn-xs btn-outline">
            <Pencil className="inline mr-1" /> Edytuj
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="btn btn-xs btn-outline btn-error"
            disabled={deletingId === row.id}
          >
            {deletingId === row.id ? <Throbber /> : (<><Trash className="inline mr-1" />Usuń</>)}
          </button>
        </div>
      ),
    },
  ]

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

      {/* Tabela użytkowników */}
      {loading ? (
        <Throbber />
      ) : (
        <Table
          data={users}
          columns={columns}
          sort={sort}
          onSortChange={(field) => {
            const next = sortField === field && sortDir === 'asc' ? 'desc' : 'asc'
            updateSearchParams({ sort: `${field}:${next}` })
          }}
          rowKey={(row) => row.id}
        />
      )}

      {/* Paginacja */}
      <Paginator
        page={page}
        limit={limit}
        total={totalUsers}
        allowedLimits={LIMIT_OPTIONS}
        onPageChange={(p) => updateSearchParams({ page: p.toString() })}
        onLimitChange={(l) => updateSearchParams({ limit: l.toString() })}
      />
    </div>
  )
}
// EOF
