```yaml
title:              "Monorepo Infrastructure & Stack (PL)"
language:           "pl"
document_type:      "repository-doc"
created_at:         "2025-12-19"
last_updated:       "2025-12-19"
tech_primary:       ["TypeScript"]
monorepo:           "Turborepo"
package_manager:    "pnpm"
apps:               ["apps/web", "apps/api"]
infra:              ["infra/docker"]
services:           ["nginx", "keycloak", "postgresql", "redis", "minio", "web", "api"]
database:           ["PostgreSQL", "Prisma (^7.0.0)"]
```

- [Wstęp](#wstęp)
- [Opis repozytorium](#opis-repozytorium)
- [Struktura katalogów](#struktura-katalogów)
- [Narzędzia (Developer Tooling)](#narzędzia-developer-tooling)
- [Stack uruchomieniowy (komponenty infrastruktury)](#stack-uruchomieniowy-komponenty-infrastruktury)
  - [NGINX](#nginx)
  - [NEXT (apps/web)](#next-appsweb)
  - [NEST (apps/api)](#nest-appsapi)
  - [REDIS](#redis)
  - [POSTGRESQL](#postgresql)
  - [MINIO](#minio)
  - [KEYCLOAK](#keycloak)
- [Własne pakiety (packages/)](#własne-pakiety-packages)
  - [`packages/database`](#packagesdatabase)
  - [`packages/schemas`](#packagesschemas)
  - [`packages/config`](#packagesconfig)
  - [`packages/logger`](#packageslogger)
  - [`packages/eslint` + `packages/tsconfig`](#packageseslint--packagestsconfig)
  - [`packages/shared/ui`](#packagessharedui)
- [Uruchamianie (lokalny development)](#uruchamianie-lokalny-development)
- [Testy](#testy)
- [Zasady i konwencje](#zasady-i-konwencje)
- [Dokumentacja](#dokumentacja)

---

# Wstęp

To repozytorium jest **monorepo** zbudowanym w oparciu o **Turborepo**, którego celem jest dostarczenie kompletnego, spójnego środowiska do budowy aplikacji webowej w architekturze **Next.js (frontend) + NestJS (backend)**, wraz z gotową infrastrukturą uruchamianą lokalnie przez **Docker Compose**.

Główne założenia:
- jeden wspólny ekosystem (aplikacje + współdzielone pakiety),
- powtarzalne środowisko developerskie (Docker, spójne konfiguracje),
- reużywalne moduły w `packages/` (config, logger, schemas, tsconfig, ui),
- gotowy “stack” usług infrastrukturalnych (SSO/RBAC, storage, cache, DB, reverse proxy).

---

# Opis repozytorium

Repozytorium składa się z:
- **2 aplikacji** w `apps/`:
  - `apps/web` – aplikacja frontendowa (Next.js)
  - `apps/api` – aplikacja backendowa (NestJS)
- **współdzielonych pakietów** w `packages/`:
  - wspólna konfiguracja TypeScript i ESLint,
  - logger,
  - schematy/walidacje,
  - pakiet bazy danych oparty o Prisma,
  - współdzielone komponenty UI (np. `packages/shared/ui`)
- **infrastruktury** w `infra/docker/`:
  - uruchomienie całego stacku usług (DB, cache, S3, SSO, reverse proxy, aplikacje)
- **testów** w `tests/`:
  - `e2e` oraz `integration`
- **narzędzi i skryptów** w `tools/scripts`

Repozytorium jest skoncentrowane głównie na **TypeScript**, z naciskiem na modularność, spójność typów oraz łatwe skalowanie projektu.

---

# Struktura katalogów

Poglądowa struktura:
```plaintext
C:.
├───.vscode
├───apps
│   ├───api
│   └───web
├───docs
├───infra
│   └───docker
│       ├───api
│       ├───keycloak
│       ├───minio
│       ├───nginx
│       ├───postgres
│       ├───redis
│       └───web
├───packages
│   ├───config
│   ├───database
│   ├───eslint
│   ├───logger
│   ├───schemas
│   ├───ui
│   └───tsconfig
├───tests
│   ├───e2e
│   └───integration
└───scripts
```
---

# Narzędzia (Developer Tooling)

W repozytorium wykorzystywane są następujące narzędzia i standardy pracy:

- **VS Code** – rekomendowane IDE (ustawienia i workspace w `.vscode/`)
- **Docker** – uruchamianie lokalnej infrastruktury i usług
- **Turborepo** – orkiestracja monorepo, cache buildów, pipeline
- **pnpm** – menedżer pakietów i workspace
- **GitHub** – hosting repozytorium oraz CI/CD

---

# Stack uruchomieniowy (komponenty infrastruktury)

Poniżej komponenty, z których składa się stack:

## NGINX
- Reverse proxy / entrypoint do środowiska
- Terminacja TLS (jeśli skonfigurowane certyfikaty)
- Routing do aplikacji `web` (Next.js) i `api` (NestJS)
- Centralne miejsce do ustawień nagłówków, limitów i reguł proxy
```yaml
URL:            "modulon/local"
HTTPS:          true
SSL:            true
ENDPOINTS:
    NEXT:       "./"
    NEST:       "./api"
    KEYCLOAK:   "./auth"
    MINIO:      "./minio"
    HEALTH:     "./health"
```

## NEXT (apps/web)
- Frontend aplikacji (Next.js)
- Integracja z backendem przez NGINX (jedna brama wejściowa)
- Wspólne typy i schematy importowane z `packages/`
```yaml
PORT: 3000
```

## NEST (apps/api)
- Backend API (NestJS)
- Integracja z DB (PostgreSQL) przez Prisma
- Integracja z cache (Redis) oraz usługami zewnętrznymi (np. MinIO, Keycloak)
```yaml
PORT: 5000
```

## REDIS
- Cache / sesje / rate-limiting / kolejki (zależnie od implementacji w API)
- Przyspieszenie odczytów i odciążenie bazy danych
```yaml
PORT: 6379
```

## POSTGRESQL
- Główna baza danych
- Warstwa dostępu do danych realizowana przez Prisma (`packages/database`)
```yaml
PORT: 5432
```

## MINIO
- Kompatybilny z S3 storage na pliki (np. uploady, załączniki, obrazy)
- Wygodny lokalnie do developmentu zamiast “prawdziwego” S3
```yaml
PORT: 9000
CONSOLE_PORT: 9001
```

## KEYCLOAK
- Identity Provider dla **SSO / OAuth2 / OIDC**
- Zarządzanie użytkownikami, rolami oraz **RBAC**
- Możliwe scenariusze:
  - logowanie do aplikacji web
  - autoryzacja dostępu do zasobów API
  - federacja użytkowników
```yaml
PORT: 8080
```

---

# Własne pakiety (packages/)

Repozytorium posiada moduły współdzielone, które ograniczają duplikację kodu i poprawiają spójność:

## `packages/database`
- Warstwa bazy danych w oparciu o **Prisma (^7.0.0)**
- Centralne miejsce na:
  - `schema.prisma`
  - migracje
  - client Prisma
  - wspólne helpery / typy DB (jeśli dodane)

## `packages/schemas`
- Schematy walidacji (np. pod DTO, formularze, requesty)
- Jedno źródło prawdy dla walidacji i typów domenowych (tam gdzie to możliwe)

## `packages/config`
- Wspólna konfiguracja runtime/build (np. env handling, wspólne ustawienia)

## `packages/logger`
- Wspólny logger (spójny format logów dla `api` i ewentualnie `web`)

## `packages/eslint` + `packages/tsconfig`
- Spójne reguły ESLint i konfiguracje TypeScript w całym monorepo

## `packages/shared/ui`
- Współdzielone komponenty UI (jeśli web korzysta z wielu modułów/feature’ów)

---

# Uruchamianie (lokalny development)

Infrastruktura jest przygotowana pod uruchomienie przez Docker (Compose) z katalogu `infra/docker`.

Typowy flow lokalny:
1. uruchomienie usług infrastruktury (Postgres/Redis/MinIO/Keycloak/NGINX),
2. uruchomienie aplikacji `web` i `api`

---

# Testy

- `tests/e2e` – testy end-to-end (np. testowanie flow przez HTTP)
- `tests/integration` – testy integracyjne (np. API + DB)

---

# Zasady i konwencje

- Monorepo: współdzielone konfiguracje trzymamy w `packages/*` (nie per-aplikacja).
- Wspólne schematy i typy: preferowane źródło prawdy w `packages/schemas` / `packages/database`.
- Dostęp do infrastruktury: przez NGINX jako “single entrypoint”.
- Minimalizujemy “sekrety” w repo — trzymamy je w `.env` i/lub managerze sekretów (poza gitem).

---

# Dokumentacja

- `docs/` – dodatkowe dokumenty projektowe (architektura, ADR, runbooki, diagramy).
- Ten plik opisuje przede wszystkim warstwę **infra/stack/monorepo**.

---