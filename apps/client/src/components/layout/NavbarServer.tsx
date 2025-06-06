// @file: src/components/layout/NavbarServer.tsx

import Navbar from './Navbar'
import { getMe } from '@/lib/auth/server.auth'
import { castToUserRole } from '@/lib/auth/role.auth'
import { adminsOnly } from '@/lib/auth/rbac.presets'

export default async function NavbarServer() {
  const me = await getMe()
  const isAdmin = adminsOnly.includes(castToUserRole(me?.role))
  return <Navbar isAdmin={isAdmin} />
}
