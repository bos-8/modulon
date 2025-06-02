// @file: apps/client/src/types/auth.ts
// @description Common authentication types for context and API responses
export enum UserRole {
  ROOT = 'ROOT',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
  GUEST = 'GUEST',
}


export type User = {
  id: string
  email: string
  role: string
}

export type AuthResponse = {
  user: User
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
// EOF


// export type User = {
//   uuid_user: string;
//   email: string;
//   role: UserRole;
//   username?: string;
//   createdAt?: string;
//   updatedAt?: string;
// };

// export type MeResponse = {
//   user: User;
//   expiresAt: string;
// };

// export type LoginResponse = {
//   user: User;
//   accessToken: string;
//   expiresAt?: string;
// };

// export type AuthContextType = {
//   user: User | null;
//   expiresAt: Date | null;
//   isAuthenticated: boolean;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: (onFinish?: () => void) => Promise<void>;
//   logoutAll: (onFinish?: () => void) => Promise<void>;
//   refreshSession: () => Promise<void>;
//   setExpiresAt: (date: Date | null) => void;
//   checkAuth: () => Promise<void>;
// };