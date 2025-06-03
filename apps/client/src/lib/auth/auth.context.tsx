// @file: apps/client/src/lib/auth/auth.context.tsx

'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react'
import { fetchMe, logout } from './auth.api'
import { scheduleSessionExpiryWarning } from './session'
import { SessionExpiryPopup } from '@/components/ui/SessionExpiryPopup'
import { User, UserRole } from './auth.types'
import api from '@/lib/api/axios'

type AuthContextType = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  initializeUserSession: () => Promise<void>
  tokenExpiresAt: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Inicjalizacja po załadowaniu
  useEffect(() => {
    initializeUserSession()
    return clearAllTimers
  }, [])

  // Automatyczne wylogowanie
  useEffect(() => {
    if (!tokenExpiresAt) return

    const now = Date.now()
    const remaining = tokenExpiresAt - now

    if (remaining <= 0) {
      handleLogout()
      return
    }

    logoutTimeoutRef.current = setTimeout(handleLogout, remaining)

    return () => {
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current)
    }
  }, [tokenExpiresAt])

  // Inicjalizacja sesji i popupu
  const initializeUserSession = async () => {
    try {
      const me = await fetchMe()
      setUser(me)

      if (!me.exp) {
        setTokenExpiresAt(null)
        await handleLogout()
        return
      }

      const expTime = me.exp * 1000
      setTokenExpiresAt(expTime)

      warningTimeoutRef.current = scheduleSessionExpiryWarning(me.exp, () => {
        setShowPopup(true)
        console.warn('[SESSION] Session is about to expire.')
      })
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Odświeżenie tokena
  const handleRefreshToken = async () => {
    try {
      await api.post('/auth/refresh')
      setShowPopup(false)
      await initializeUserSession()
    } catch {
      await handleLogout()
    }
  }

  // Wylogowanie
  const handleLogout = async () => {
    clearAllTimers()
    await logout()
    setUser(null)
    setTokenExpiresAt(null)
    setShowPopup(false)
    window.location.href = '/login'
  }

  // Refetch użytkownika ręcznie
  const refreshUser = async () => {
    try {
      const me = await fetchMe()
      setUser(me)
      setTokenExpiresAt(me.exp * 1000)
    } catch {
      setUser(null)
      await handleLogout()
    }
  }

  // Czyszczenie timerów
  const clearAllTimers = () => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout: handleLogout,
        refreshUser,
        initializeUserSession,
        tokenExpiresAt,
      }}
    >
      {children}

      {tokenExpiresAt && showPopup && (
        <SessionExpiryPopup
          expiresAt={tokenExpiresAt}
          onExtend={handleRefreshToken}
          onLogout={handleLogout}
        />
      )}
    </AuthContext.Provider>
  )
}

// Hooks
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const useUserRole = (): UserRole => {
  const user = useUser()
  const rawRole = user?.role

  if (rawRole && Object.values(UserRole).includes(rawRole as UserRole)) {
    return rawRole as UserRole
  }

  return UserRole.GUEST
}

export const useHasRole = (role: UserRole): boolean => {
  return useUserRole() === role
}

export const useIsRoleAtLeast = (minRole: UserRole): boolean => {
  const userRole = useUserRole()
  if (!userRole) return false

  const rolePriority: Record<UserRole, number> = {
    [UserRole.ROOT]: 6,
    [UserRole.SYSTEM]: 5,
    [UserRole.ADMIN]: 4,
    [UserRole.MODERATOR]: 3,
    [UserRole.USER]: 2,
    [UserRole.GUEST]: 1,
  }

  return rolePriority[userRole] >= rolePriority[minRole]
}

export const useUser = () => useAuth().user
export const useAuthLoading = () => useAuth().loading
export const useLogout = () => useAuth().logout
export const useRefreshUser = () => useAuth().refreshUser
export const useIsAuthenticated = () => !!useAuth().user
export const useTokenExpiration = () => useAuth().tokenExpiresAt
export const useInitializeSession = () => useAuth().initializeUserSession

export const useIsAdmin = () => useHasRole(UserRole.ADMIN)
export const useIsModerator = () => useHasRole(UserRole.MODERATOR)
export const useIsSystem = () => useHasRole(UserRole.SYSTEM)
export const useIsRoot = () => useHasRole(UserRole.ROOT)
// EOF
