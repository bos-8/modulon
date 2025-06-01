# modulon


```
modulon/
├── apps/
│   ├── client/                    # Frontend: Next.js (App Router)
│   │   ├── app/                   # Routing: pages/layouts/API proxy
│   │   ├── components/            # UI komponenty
│   │   ├── lib/                   # Klientowe utils, axios, hooks
│   │   ├── types/                 # Typy domenowe
│   │   ├── styles/                # Tailwind / global CSS
│   │   ├── public/                # Assety statyczne
│   │   ├── middleware.ts          # Middleware (auth redirect)
│   │   ├── .env.local             # NEXT_PUBLIC_ zmienne
│   │   └── next.config.js         # Konfiguracja Next.js
│   │
│   └── server/                    # Backend: NestJS
│       ├── src/
│       │   ├── main.ts            # Bootstrap
│       │   ├── app.module.ts      # Główny moduł
│       │   ├── config/            # ConfigService, env, helmet, cors
│       │   ├── modules/           # Moduły domenowe (auth, user, contest…)
│       │   ├── database/          # PrismaService, connection
│       │   ├── guards/            # Auth, RoleGuard
│       │   ├── interceptors/      # Timeout, Logger
│       │   ├── strategies/        # Passport (JWT, Google)
│       │   ├── decorators/        # CurrentUser itp.
│       │   └── common/            # Helpers, logger, const
│       ├── prisma/
│       │   ├── schema.prisma      # Definicja bazy danych
│       │   └── migrations/        # Prisma migracje
│       └── .env.local             # BACKEND secrets (JWT, DB, Redis)
│
├── docker/                        # Dockerfiles i docker-compose
│   ├── client/                    # Dockerfile dla Next.js
│   ├── server/                    # Dockerfile dla NestJS
│   ├── db/                        # PostgreSQL init i config
│   ├── redis/                     # Redis config
│   └── docker-compose.yml         # Stack dev/prod
│
├── infra/                         # Infrastruktura (nginx, certyfikaty)
│   ├── nginx/                     # Proxy + SSL + LBA ready
│   ├── certs/                     # Certyfikaty TLS
│   └── traefik/                   # (opcjonalnie: dla dynamic LBA)
│
├── packages/                      # Współdzielone paczki
│   ├── types/                     # Uniwersalne typy domenowe
│   └── utils/                     # Wspólne helpery (np. validate.ts)
│
├── scripts/                       # Skrypty CLI
│   ├── init.sh                    # Bootstrap projektu
│   ├── migrate.sh                 # Prisma migrate
│   └── seed.ts                    # Seeding danych
│
├── docs/                          # Dokumentacja i diagramy
│   ├── README.md
│   ├── architecture.md
│   ├── database.md
│   └── diagrams/
│       ├── system.mmd             # Mermaid: architektura
│       └── auth-flow.mmd
│
├── .env                           # (opcjonalnie) global fallback
├── .gitignore
├── README.md
└── turbo.json / nx.json           # Monorepo orchestrator (Turbo/NX)
```