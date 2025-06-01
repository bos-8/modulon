

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
npm install helmet cookie-parser @nestjs/config
npm install class-validator class-transformer
```

## PRISMA
```powershell
mkdir -p .\src\database
npx nest g mo database/prisma --flat
npx nest g s database/prisma --flat
```

### MIGRACJA
```powershell
npx prisma migrate dev --name init-db-schema
```



# CLIENT
npm install react-bootstrap-icons
npm install next-intl
npm install react-hook-form zod @hookform/resolvers

