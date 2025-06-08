

1. Utworzenie struktury folderów:
```
modulon
├───apps
│   ├───client
│   └───server
├───docker
└───docs
```

```powershell
mkdir -p ./apps
mkdir -p ./apps/client
mkdir -p ./apps/server
mkdir -p ./docker
mkdir -p ./docs
```

2. Inicjalizacja FRONTEND - `Next.js`
```powershell
cd ./apps/client
npx create-next-app@latest .
```
√ Would you like to use TypeScript? ...  `Yes`
√ Would you like to use ESLint? ...  `Yes`
√ Would you like to use Tailwind CSS? ...  `Yes`
√ Would you like your code inside a `src/` directory? ...  `Yes`
√ Would you like to use App Router? (recommended) ...  `Yes`
√ Would you like to use Turbopack for `next dev`? ...  `Yes`
√ Would you like to customize the import alias (`@/*` by default)? ... `No`


1. Inicjalizacja BACKENDU - `Nest.js` + `Prisma`
```powershell
cd ../server
npx @nestjs/cli new .
npm install prisma --save-dev
npm install @prisma/client
npx prisma init

```
Which package manager would you to use? `npm`

2. Utworzenie bazy danych - `modulon`
```sql
CREATE DATABASE contest_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```


# SERVER
```powershell
# Packets
npm install helmet cookie-parser @nestjs/config
npm install class-validator class-transformer
npm install @nestjs/passport passport
npm install @nestjs/jwt passport-jwt
npm install argon2
npm install uuid
npm install @nestjs/throttler

# Types
npm install -D @types/passport-jwt @types/passport @types/argon2
npm install @nestjs/core@^10.4.18 @nestjs/common@^10.4.18 @nestjs/platform-express@^10.4.18 @nestjs/testing@^10.4.1

# Instalacja do najnowszych wersji
npm install -g npm-check-updates
ncu -u #update do najnowszych wersji
```



## MODUŁY
```powershell
# auth
nest g module modules/auth
nest g controller modules/auth
nest g service modules/auth
nest g class modules/auth/auth.dto --flat

# guards
mkdir -p .\src\guards
nest g guard guards/jwt
nest g guard guards/roles

# strategies
mkdir -p .\src\strategies
nest g class strategies/jwt.strategy --flat

# decorators
mkdir -p .\src\decorators
nest g decorator decorators/current-user --flat

# admin/user
nest g module modules/admin/user
nest g controller modules/admin/user
nest g service modules/admin/user
nest g class modules/admin/user/user.dto --flat
nest g class modules/admin/user/user.exception --flat

# admin/session
nest g module modules/admin/session
nest g controller modules/admin/session
nest g service modules/admin/session
nest g class modules/admin/session/session.dto --flat

# user/dashboard
nest g module modules/user/dashboard
nest g controller modules/user/dashboard
nest g service modules/user/dashboard
nest g class modules/user/dashboard/dashboard.dto --flat
```






## PRISMA
```powershell
mkdir -p .\src\database
npx nest g mo database/prisma --flat
npx nest g s database/prisma --flat
```

### GENERACJA
Kiedy nie widzi Typescript np.: UserRole
```powershell
npx prisma generate
```

### MIGRACJA
```powershell
npx prisma migrate dev --name init-db-schema
npx prisma migrate dev --name user-role
```



# CLIENT
npm install react-bootstrap-icons
npm install next-intl
npm install react-hook-form zod @hookform/resolvers
npm install axios
npm install jwt-decode





# THROTTLER TEST
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