// @file: packages/types/user/user.type.ts
import { Role } from './role.enum';

export interface UserType {
  id: string;
  email: string;
  role: Role;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
