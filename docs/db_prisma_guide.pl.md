# KONFIGURACJA NEST.JS +  PRISMA

> [!WARNING]
> Tą konfiguracje nalerzy wykonać dopiero po wykonaniu tej instrukcji: [TURBOREPO_GUIDE](./turborepo_guide.pl.md)

> [!NOTE]
> W środowisku developerskim wykorzystano `XAMPP v.8.2.12`

## XAMPP
> [!IMPORTANT]
> W XAMPP utwórz taką bazę danych: `modulon`
> ```sql
> CREATE DATABASE modulon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```

## PRISMA
Upewnij się że schema.prisma wygląda następująco:
```typescript
// @file: packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
//...
```
oraz jest ustawiony plik `.env`
```shell
# @file: packages/database/.env
DATABASE_URL="mysql://root:@localhost:3306/modulon"
```

Wykonaj pierwszą migracje:
```powershell
# <<<POWERSHELL>>>
# modulon>
npx turbo run db:generate
npx turbo run db:migrate
```

> [!TIP]
> Jeśli powyższe komendy zwracają błąd wykonaj na root directory: `npm install`

## SERVER - NEST.JS
Wykonaj komendy:
```powershell
# <<<POWERSHELL>>>
# modulon>
cd .\apps\server
nest g module database/prisma
```
Wklej do nowo utworzonego pliku:
```typescript
// @file: server/src/database/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from '@modulon/database';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }
```

> [!TIP]
> Jeśli `'@modulon/database'` daje błąd wykonaj komendę `npx turbo run dev` na głównym poziomie folderu *(wykona to build dla prismy, dzięki czemu nest bedzie widział moduł poprawnie)*.

### ZASTOSOWANIE - *PRZYKŁAD*

```typescript
// @file: apps/server/src/modules/example/example.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modulon/database';    //<<< PRISMA

@Injectable()
export class ExampleService {
  constructor(private prisma: PrismaService) { }      //<<< PRISMA

  async getDataFromDB() {
    return this.prisma.data.findMany()                //<<< PRISMA USECASE
  }
}
```