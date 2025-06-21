# KONFIGURACJA SERVER - NEST.JS

> [!WARNING]
> Tą konfiguracje nalerzy wykonać dopiero po wykonaniu tej instrukcji: [TURBOREPO_GUIDE](./turborepo_guide.pl.md)

## INSTALACJA PAKIETÓW
```powershell
# PACKETS
npm install helmet cookie-parser
npm install class-validator class-transformer
npm install @nestjs/passport passport
npm install @nestjs/jwt passport-jwt
npm install argon2
npm install uuid
npm install @nestjs/throttler
npm install @nestjs/config
```

## TWORZENIE MODUŁÓW VIA NEST CLI
```powershell
# DB-PRISMA
nest g module database/prisma

# AUTH
nest g module modules/auth
nest g controller modules/auth
nest g service modules/auth
nest g class modules/auth/auth.dto --flat

# user/dashboard
nest g module modules/user/dashboard
nest g controller modules/user/dashboard
nest g service modules/user/dashboard
nest g class modules/user/dashboard/dashboard.dto --flat
```

## THROTTLER TEST via PowerShell
```typescript
// Endpoint z throttler global
  @Get('ping')
  // @Throttle({ default: { limit: 4, ttl: 60000 } }) // <<< nadpisuje globala
  ping() {
    return { pong: true, ts: Date.now() }
  }
```

```powershell
# 15 zapytań na endpoint auth/ping
1..15 | ForEach-Object { Invoke-RestMethod http://localhost:5000/auth/ping; "" }
```

## MILESTONES
1. Podłączenie PRISM-y z `@modulon/database` i ustawienie jako moduł globalny
2. Utworzenie modułu AUTH z endpointami