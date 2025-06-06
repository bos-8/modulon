// @file: client/src/app/[locale]/admin/edit/user/userForm.schema.ts

import { z } from 'zod'
import { UserRole } from '@/lib/types/user'

/**
 * Schemat formularza tworzenia nowego użytkownika (zgodny z CreateUserDto)
 * - Hasło i confirmPassword są wymagane i muszą się zgadzać
 * - Rola opcjonalna, domyślnie USER
 */
export const userFormSchema = z.object({
  email: z.string().email({ message: 'Nieprawidłowy email' }),
  username: z.string().optional(),
  name: z.string().optional(),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  confirmPassword: z.string().min(6, 'Powtórz hasło'),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła muszą być identyczne',
  path: ['confirmPassword'],
})

/**
 * Schemat formularza edycji użytkownika (zgodny z UpdateUserDto)
 * - Hasło opcjonalne (nie ma pola confirm)
 * - Wymagane pola rola, isActive, isBlocked
 */
export const userEditFormSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  isEmailConfirmed: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła muszą być identyczne',
  path: ['confirmPassword'],
})

export type UserFormData = z.infer<typeof userFormSchema>
export type UserEditFormData = z.infer<typeof userEditFormSchema>
// EOF