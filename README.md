# MODULON

MODULON is a modular full-stack web platform built with **Next.js App Router** and **NestJS**. It features a highly secure authentication system, session management, RBAC authorization, and a scalable monorepo architecture powered by **Turborepo**.

## Tech Stack

### Language
- **TypeScript**

### Frontend (Client)
- **Next.js 15+** (App Router)
- **Tailwind CSS**
- **React Hook Form + Zod** for forms and validation
- **Zustand** for local/global UI state
- **TanStack Query** for async/server state
- **next-intl** for internationalization (i18n)
- **API Proxy Layer** using `/app/api/...` for secure backend communication

### Backend (Server)
- **NestJS** (modular architecture)
- **Prisma ORM** + **PostgreSQL**
- **JWT (Access/Refresh)** auth
- **Session-based authentication with HttpOnly cookies**
- **RBAC (Role-Based Access Control)** with custom guards
- **Email verification tokens**
- **Rate limiting, Helmet, and CSP for security**

### Database (Prisma)
- For develping time - XAMPP MariaDB -> Prod target -> PostrageSQL

### Tooling
- **Turborepo** for monorepo management
- **Workspaces**:
  - `apps/client` – Next.js app
  - `apps/server` – NestJS API
  - `packages/types` – shared TypeScript types
  - `packages/database` – Prisma client & schema

## Security Highlights
- Secure **access/refresh token flow**
- Tokens stored in **HttpOnly, SameSite=Lax cookies**
- Refresh flow with **sliding expiration window**
- **Session table in DB** with expiration and device/IP info
- Popup warning before session expires (Zustand)
- Secure API proxy (Node runtime, full cookie forwarding)
- Rate limiting, Helmet headers, and secure CSP

## Features
- [x] User Registration with email verification
- [x] Login + Token-based auth
- [x] Session refresh flow with countdown popup
- [x] Logout from anywhere (popup, navbar, programmatically)
- [x] Role-based protection (User, Admin, System, Root)
- [x] Admin Panel: user & session management
- [x] SSR-safe architecture
- [x] i18n-ready: Polish (default) + English

## Monorepo Structure

```bash
modulon/
├── apps/
│   ├── client/             # FRONTEND  - NEXT.JS
│   └── server/             # BACKEND   - NEST.JS
├── packages/
│   ├── database/           # DATABASE  - PRISMA schema & client
│   └── types/              # TYPES     - Sheared (UserRole, DTOs, etc.)
├── turbo.json              # TURBOREPO - config tasks
└── tsconfig.base.json      # TSCONFIG
````