

## Przygotowanie środowiska Node.js + PNPM
1. Instalacja node.js
[Node.js](https://nodejs.org/en/download)

1. Pobranie `pnpm` i instalacja
```powershell
corepack enable pnpm
```

3. Weryfikacja
```powershell
node -v
# v24.12.0
pnpm -v
# 10.26.0
```

## Inicializacja monorepo
1. utworzenie repo i initializacja pnpm
```powershell
# cd ./modulon
pnpm init
```

2. dodanie pnpm-workspaces: `pnpm-workspaces.yaml`

## Instalacja Turbo
```powershell
# .\modulon
pnpm add -D turbo -w
```
Dodanie plików: `turbo.json`

## Instalowanie Rimraf
```powershell
# .\modulon
pnpm add -D rimraf -w
```
Dodanie plików: `.npmrc`


## Instalacja NEXT.JS
```powershell
if (Test-Path .\apps\web) { Remove-Item .\apps\web -Recurse -Force }
pnpm dlx create-next-app@latest apps/web
# Would you like to use the recommended Next.js defaults? » No, customize settings
# Would you like to use TypeScript? ...  Yes
# Which linter would you like to use? » ESLint
# Would you like to use React Compiler? ... No
# Would you like to use Tailwind CSS? ...Yes
# Would you like your code inside a `src/` directory? ...  Yes
# Would you like to use App Router? (recommended) ...  Yes
# Would you like to customize the import alias (`@/*` by default)? ... Yes
# What import alias would you like configured? ... @/*
```

## Instalacja NEST.JS
```powershell
if (Test-Path .\apps\api) { Remove-Item .\apps\api -Recurse -Force }
pnpm dlx @nestjs/cli@latest new apps/api --package-manager=pnpm --skip-git
pnpm -C apps/api add -D @nestjs/cli
```



# DOCKER

## CERTYFIKATY POD NGINX
## Certyfikaty TLS pod Nginx (DEV) — mkcert + WSL2 (Ubuntu) + Windows

Poniższa instrukcja tworzy **lokalnie zaufany** certyfikat TLS dla domeny `modulon.local` (oraz `localhost`, `127.0.0.1`, `::1`) i pozwala używać HTTPS w środowisku developerskim za Nginx.

---

### 1) Wymagania

* Windows + WSL2 (Ubuntu)
* Docker Desktop
* Dostęp do plików projektu z WSL (np. `/mnt/c/...`)

---

## A) Utworzenie certyfikatów w WSL2 (Ubuntu)

1. Zainstaluj `mkcert` i narzędzia do trust store:

```bash
sudo apt update
sudo apt install -y mkcert libnss3-tools
```

2. Przejdź do katalogu projektu i utwórz folder na certyfikaty (przykład ścieżki — zmień na swoją):

```bash
cd /mnt/c/Users/<TWOJ_USER>/Documents/GitHub/modulon
mkdir -p infra/docker/nginx/certs
cd infra/docker/nginx/certs
```

3. Zainstaluj lokalne CA (Certificate Authority) `mkcert` w środowisku:

```bash
mkcert -install
```

4. Wygeneruj certyfikat dla `modulon.local` oraz lokalnych adresów:

```bash
mkcert modulon.local localhost 127.0.0.1 ::1
```

W tym folderze powstaną pliki:

* `modulon.local+X.pem` *(certyfikat — nazwa może mieć `+1`, `+2` itd.)*
* `modulon.local+X-key.pem` *(klucz prywatny)*

5. Skopiuj certyfikat CA (ROOT) do tego folderu — będzie potrzebny do zaufania na Windows:

```bash
cp "$(mkcert -CAROOT)/rootCA.pem" .
```

> **Uwaga:** nie kopiuj i nie commituj `rootCA-key.pem` (to prywatny klucz CA).

---

## B) Dodanie domeny do `hosts` na Windows

1. Otwórz Notatnik jako Administrator
2. Otwórz plik:

```
C:\Windows\System32\drivers\etc\hosts
```

3. Dodaj linię:

```
127.0.0.1 modulon.local
```

4. Zapisz plik

---

## C) Instalacja certyfikatu CA na Windows (żeby przeglądarka ufała HTTPS)

1. W folderze:

```
infra/docker/nginx/certs
```

znajdź plik:

* `rootCA.pem`

2. Zmień jego rozszerzenie:

* `rootCA.pem` → `rootCA.crt`

3. Otwórz okno certyfikatów:

* `WIN + R` → wpisz:

```
certmgr.msc
```

4. Przejdź do:

* **Zaufane główne urzędy certyfikacji** → **Certyfikaty**

5. Kliknij prawym:

* **Wszystkie zadania → Importuj...**

6. Wskaż plik `rootCA.crt` i wybierz magazyn:

* **Zaufane główne urzędy certyfikacji**

7. Zakończ import

Po tym kroku Chrome/Edge powinny ufać certyfikatowi.

> **Firefox:** jeśli nadal pokazuje ostrzeżenie, ustaw w `about:config`:
> `security.enterprise_roots.enabled = true`

---

## D) Podpięcie certyfikatów w Nginx (ścieżki)

W konfiguracji Nginx (dev) użyj:

* `ssl_certificate` → plik `modulon.local+X.pem`
* `ssl_certificate_key` → plik `modulon.local+X-key.pem`

Przykład (dopasuj do ścieżki wewnątrz kontenera):

```nginx
ssl_certificate     /etc/nginx/certs/modulon.local+1.pem;
ssl_certificate_key /etc/nginx/certs/modulon.local+1-key.pem;
```

---

## E) Usunięcie certyfikatu CA z Windows (opcjonalnie)

1. `WIN + R` → wpisz:

```
certmgr.msc
```

2. **Zaufane główne urzędy certyfikacji** → **Certyfikaty**
3. Znajdź wpis związany z `mkcert`
4. PPM → **Usuń**

---

Jeśli chcesz, dopiszę do tego gotowy fragment `docker-compose.yml` (volume mount certów) i gotowy `nginx.conf` pod `/`, `/api`, `/auth`.
