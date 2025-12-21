```yaml
title:                  "CONTRIBUTING (Engineering Rules)"
language:               "en"
document_type:          "contributing-guide"
created_at:             "2025-12-22"
last_updated:           "2025-12-22"

repository:
  type:                 "monorepo"
  tool:                 "turborepo"
  package_manager:      "pnpm"

requirements:
  node:                 ">=24.12.0"
  pnpm:                 ">=10.26.0"
  docker:               "required for infra stack"

quality_gates:
  required_on_pr:       ["lint", "typecheck", "test"]
  security:             ["no-secrets", "rbac-server-side", "input-validation"]

frontend_rules:
  components_folders:   ["apps/web/src/components/ui", "apps/web/src/components/layout"]
  ssr_critical:         ["auth", "rbac", "protected-routes"]
  i18n:                 "next-intl (namespaced messages)"

code_rules:
  stateless_default:    true
  file_header:          "// @file: <repo-path>"
  types_required:       true
  defensive_inputs:     true

scalability_note:
  target:               "horizontal"
  avoid_in_memory:      ["sessions", "rate-limit", "job-queue", "locks"]
```

- [Engineering Rules for This Monorepo](#engineering-rules-for-this-monorepo)
  - [0) Purpose](#0-purpose)
- [1) Language and communication](#1-language-and-communication)
- [2) Code style: self-describing first](#2-code-style-self-describing-first)
- [3) File header requirement](#3-file-header-requirement)
- [4) Stateless-first architecture](#4-stateless-first-architecture)
- [5) Defensive programming (bad input ready)](#5-defensive-programming-bad-input-ready)
- [6) Types everywhere](#6-types-everywhere)
- [7) Helpers \& reuse (reduce duplication)](#7-helpers--reuse-reduce-duplication)
- [8) Performance rules (mandatory)](#8-performance-rules-mandatory)
  - [8.1 Avoid shipping unnecessary data to the client](#81-avoid-shipping-unnecessary-data-to-the-client)
  - [8.2 Prefer Server Components / SSR for critical flows](#82-prefer-server-components--ssr-for-critical-flows)
  - [8.3 Keep client components lean](#83-keep-client-components-lean)
- [9) Scalability awareness (vertical now, horizontal later)](#9-scalability-awareness-vertical-now-horizontal-later)
- [10) Frontend structure rules (apps/web)](#10-frontend-structure-rules-appsweb)
  - [10.1 Component location policy](#101-component-location-policy)
  - [10.2 SSR for auth \& protected routes](#102-ssr-for-auth--protected-routes)
- [11) Clean Code + Enterprise Security (no shortcuts)](#11-clean-code--enterprise-security-no-shortcuts)
  - [11.1 Mandatory security rules](#111-mandatory-security-rules)
  - [11.2 Security documentation](#112-security-documentation)
- [12) Error handling \& logging policy](#12-error-handling--logging-policy)
- [13) Config \& environment rules](#13-config--environment-rules)
- [14) Testing baseline](#14-testing-baseline)
- [15) Dependency hygiene](#15-dependency-hygiene)
- [16) PR / Review checklist (minimum)](#16-pr--review-checklist-minimum)


## Engineering Rules for This Monorepo

### 0) Purpose

These rules exist to keep the codebase:

* maintainable and predictable,
* secure by default (enterprise-level),
* ready for future horizontal scaling,
* consistent across `apps/*` and `packages/*`.

---

## 1) Language and communication

* **Think and write in English** (code, comments, docs, commit messages).
* Prefer clear technical wording over slang.

---

## 2) Code style: self-describing first

* Write **self-describing code**:

  * meaningful names,
  * small functions,
  * single responsibility.
* Add comments only when:

  * the “why” is not obvious,
  * there is a non-trivial tradeoff,
  * there is a security implication.
* Comments must be **in English** and must explain **intent**, not restate the code.

---

## 3) File header requirement

Every code file must start with a single-line header:

```ts
// @file: apps/web/src/components/ui/button.tsx
```

Rules:

* Always use the repo path from root.
* Keep it as the first line (before imports).

---

## 4) Stateless-first architecture

**Default rule:** code should be stateless.

What “stateless” means here:

* No global mutable state.
* No module-level caches that change at runtime.
* No singleton objects storing request/user data.

Allowed:

* pure helper functions,
* deterministic transformations,
* stateless services created per request.

If state is unavoidable (rare):

* justify it in a short comment,
* explain horizontal-scaling impact,
* prefer external state (DB/Redis) over in-memory state.

---

## 5) Defensive programming (bad input ready)

* Assume inputs can be invalid unless:

  * they were validated earlier in the same request flow **and**
  * this is explicitly documented.
* Validate at boundaries:

  * HTTP request DTO validation (API),
  * form validation (Web),
  * config validation (startup).
* Fail safely:

  * return correct HTTP codes,
  * never leak internals,
  * log enough for troubleshooting (without secrets).

---

## 6) Types everywhere

* Prefer strict TypeScript:

  * avoid `any`,
  * avoid unsafe type assertions unless justified.
* Model domain types explicitly.
* Shared contracts belong in `packages/*`:

  * `@modulon/types`, `@modulon/schemas`, etc.
* Prefer schema-driven types:

  * zod schema → inferred types (single source of truth).

---

## 7) Helpers & reuse (reduce duplication)

* If you can reduce repeated logic with a **simple, readable helper**, do it.
* Prefer helpers when they:

  * remove repeated code across files/features,
  * centralize validation/formatting/mapping,
  * reduce bug surface area.
* Avoid helpers that add abstraction without real value:

  * no “helper for everything”,
  * no over-engineered utility layers.

Recommended patterns:

* “pure functions” for formatting, parsing, mapping,
* small reusable UI primitives in `components/ui`,
* shared business rules in `packages/*`.

---

## 8) Performance rules (mandatory)

Performance must be treated as a feature, not an afterthought.

### 8.1 Avoid shipping unnecessary data to the client

* Do not send large translation dictionaries, large configs, or server-only constants to the browser.
* For i18n, prefer **feature/route-group split** messages over one massive JSON when the app grows.

### 8.2 Prefer Server Components / SSR for critical flows

* Render critical flows on the server whenever it benefits:

  * authentication state,
  * RBAC gating,
  * protected routes,
  * security-sensitive decisions.

### 8.3 Keep client components lean

* Minimize client-side state.
* Avoid heavy libraries for simple tasks.
* Be careful with re-render cascades:

  * memoize only when needed,
  * keep props stable,
  * avoid unnecessary context re-renders.

---

## 9) Scalability awareness (vertical now, horizontal later)

When proposing or implementing architecture:

* Prefer horizontally scalable approaches.
* Avoid:

  * in-memory sessions,
  * per-instance caches without shared store,
  * local-only locks for correctness.

If you choose a vertical-optimized shortcut (discouraged, but sometimes pragmatic):

* add a short comment:

> “Note: Not horizontally scalable because …; acceptable for now because …; migration path: ….”

---

## 10) Frontend structure rules (apps/web)

### 10.1 Component location policy

In the frontend, almost all reusable components must live in:

* `apps/web/src/components/ui`
  For: buttons, inputs, modals, dropdowns, tables, primitive UI blocks.

* `apps/web/src/components/layout`
  For: Navbar, Footer, AppShell, page wrappers, layout composition.

Rules:

* Page files (`app/**/page.tsx`) should be as thin as possible:

  * orchestration + composition,
  * no heavy UI duplication.
* Reuse UI primitives instead of rewriting the same markup.

### 10.2 SSR for auth & protected routes

* Anything related to:

  * authentication state,
  * user role,
  * access permissions,
  * protected navigation items,
    should be resolved on the server when possible (SSR / Server Components / middleware).

Client-side checks may exist for UX, but **must not be the only protection**.

---

## 11) Clean Code + Enterprise Security (no shortcuts)

Security is not optional.

### 11.1 Mandatory security rules

* Secrets must never be committed.
* Cookies:

  * use `HttpOnly`, `Secure`, `SameSite` appropriately.
* Validate and sanitize all untrusted input.
* RBAC enforced at the API boundary (server-side).
* Rate limiting and brute-force protection where relevant.
* Never log:

  * passwords,
  * tokens,
  * secrets,
  * sensitive personal data.

### 11.2 Security documentation

When introducing auth/session/crypto/storage rules:

* document the threat (1–2 lines),
* document the control (1–2 lines).

---

## 12) Error handling & logging policy

* Never leak stack traces or internal errors to clients.
* Use consistent error responses and error codes.
* Logs must be:

  * structured,
  * level-based (debug/info/warn/error),
  * free of secrets/PII,
  * include correlation/request id where available.

---

## 13) Config & environment rules

* Validate `.env` at startup (fail fast).
* Do not rely on unsafe defaults.
* Separate configuration for dev/test/prod.
* Keep secrets outside Git and outside client bundles.

---

## 14) Testing baseline

* Unit tests for domain logic and helpers.
* Integration tests for API + DB paths.
* E2E tests for critical flows:

  * auth,
  * protected routes,
  * core user journeys.

---

## 15) Dependency hygiene

* Avoid unmaintained libraries for core features.
* Pin versions intentionally.
* Run audits in CI.
* Prefer official docs and stable ecosystems.

---

## 16) PR / Review checklist (minimum)

Every PR must satisfy:

* [x] types/lint/tests pass
* [x] security reviewed (no shortcuts)
* [x] performance considered (no huge payloads)
* [x] scaling impact noted if relevant
* [x] docs updated if behavior changes

---