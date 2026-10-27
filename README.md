# Sprint Review App

A monorepo project with NestJS backend and React frontend for managing projects, work periods, and logs.

## 📁 Project Structure

```
sprint-review-app-v2/
├── apps/
│   ├── backend/           # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/      # AuthSCH + JWT authentication
│   │   │   ├── users/     # User management
│   │   │   ├── projects/  # Project management
│   │   │   ├── work-periods/ # Work period tracking
│   │   │   └── logs/      # Work log system
│   │   ├── prisma/        # Database schema & migrations
│   │   └── test/          # Backend tests
│   └── frontend/          # React + Vite frontend
│       ├── src/
│       │   ├── pages/     # React pages
│       │   ├── components/ # Reusable components
│       │   └── context/   # React contexts
│       └── public/
├── .env                   # Environment variables
└── package.json           # Root workspace config
```

## Features

- 🔐 **AuthSCH Authentication** - BME SSO integration
- 👥 **User Management** - CRUD operations for users
- 📁 **Project Management** - Track projects and team members
- ⏱️ **Work Periods** - Manage sprint periods
- 📝 **Logging System** - Track work logs with statistics
- 📚 **Swagger Documentation** - Interactive API docs at `/api`
- ⚛️ **React Frontend** - Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 24+
- Yarn 1.22+
- PostgreSQL database

### Installation

Install all dependencies from the root:

```bash
yarn install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# - AUTHSCH_CLIENT_ID and AUTHSCH_CLIENT_SECRET from auth.sch.bme.hu
# - DATABASE_URL for PostgreSQL
# - JWT_SECRET for token signing
# - APP_URL: the public origin (default: http://localhost:3000)
```

### Database Setup

```bash
# Run migrations
cd apps/backend
yarn prisma migrate dev

# Seed database (optional)
yarn prisma db seed
```

A Docker image induláskor lefuttatja a `prisma migrate deploy`-t, így élesítéskor
nincs külön migrációs lépés. Sikertelen migrációnál a konténer nem indul el, a régi pod
kiszolgál tovább. Kockázatos migráció előtt (pl. `pg_dump` után kézi futtatással) a
`RUN_MIGRATIONS=false` környezeti változó kikapcsolja. Leállításkor a futó migráció
végigmegy, utána a konténer kilép, de ami a pod `terminationGracePeriodSeconds`-ánál tovább
tart, azt a Kubernetes megszakítja: hosszú migrációt ezért kézzel futtass.

## Development

```bash
# API on http://localhost:3001, frontend on http://localhost:3000
yarn dev
```

Open the app at `http://localhost:3000`. `next dev` forwards `/api/*` to the API
server, so the browser sees a single origin, as in production. The local AuthSCH
client's callback URL is `http://localhost:3000/api/auth/callback`.

## Production image

One image runs the whole app in one Node.js process on port 3000: NestJS serves
the API under `/api` and renders every other path with the Next.js frontend. One
container, one domain; there is no separate frontend deployment or proxy.

```bash
docker build -t sprint-review .
docker compose up --build   # local run, see docker-compose.yml
```

Runtime environment (production):

| Variable | |
|---|---|
| `APP_URL` | Public origin, e.g. `https://sprint-review.kir-dev.hu`. The AuthSCH callback is `<APP_URL>/api/auth/callback`. |
| `DATABASE_URL`, `AUTHSCH_CLIENT_ID`, `AUTHSCH_CLIENT_SECRET`, `AUTHSCH_GROUP_ID` | As in development. |
| `JWT_SECRET`, `SESSION_SECRET` | Two different strong secrets. |
| `ENABLE_SWAGGER` | Optional; Swagger UI at `/api/docs`. |
| `RUN_MIGRATIONS` | Optional; `false` skips the migrations on start. |

Probes: `GET /api/health/live` and `GET /api/health/ready`. The `Build Image`
workflow builds and smoke-tests the image on every PR, and on `main` pushes
`harbor.sch.bme.hu/org-kir-dev/sprint-review-app-v2:sha-<commit>`.

## Build

```bash
yarn build:backend
yarn build:frontend
```

## Linting & Formatting

```bash
# Check all code
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format

# Check formatting
yarn format:check
```

## Testing

```bash
# Run backend tests
yarn test

# Run e2e tests
yarn test:e2e
```
│   ├── users/             # User management
│   ├── projects/          # Project management
│   ├── work-periods/      # Sprint period tracking
│   ├── logs/              # Work log system
│   └── common/            # Shared middleware
└── prisma/                # Database schema and migrations

frontend/
├── src/
│   ├── pages/             # Login & Dashboard pages
│   ├── components/        # Reusable components
│   ├── context/           # Auth context
│   └── App.tsx            # Main app component
└── public/                # Static assets
```

## API Endpoints

Once the servers are running, you can:

- Visit `http://localhost:3000` - the app
- Visit `http://localhost:3000/api/docs` - Swagger API documentation (`ENABLE_SWAGGER=true`)
- Every API route lives under `/api`

### Authentication Flow

1. User clicks "Bejelentkezés AuthSCH-val" → `/api/auth/login` stores an OAuth
   state in a short-lived session and redirects to AuthSCH
2. AuthSCH authenticates → redirects to `/api/auth/callback`
3. The API checks the state and the PÉK group membership, then sets the JWT in an
   HttpOnly `sprint-review-session` cookie (path `/api`, 7 days) and redirects to `/login`
4. The browser sends the cookie with every `/api` request; scripts may send the
   same JWT as `Authorization: Bearer <token>`
5. `POST /api/auth/logout` clears the cookie. State-changing requests from another
   origin are rejected (403)
## Körtagsági hozzáférés (AuthSCH / PÉK)

Egy telepítést egy kör használ. A hozzáférés alapja kizárólag a backend
`AUTHSCH_GROUP_ID` környezeti változója; az adminfelület és az API nem módosíthatja.
A szükséges érték a **kör** számszerű PÉK-azonosítója, nem a felhasználó személyes PÉK-ID-ja.
Hiányzó vagy hibás értékkel a backend nem indul el. Példa a 106-os körhöz:

```dotenv
AUTHSCH_GROUP_ID=106
```

A változót az `apps/backend/.env` fájlban vagy a telepítési környezetben kell megadni.
Docker Compose esetén a gyökér `.env` fájljából kerül a konténerbe.
A változtatás újraindítást igényel. `NEXT_PUBLIC_` változat nem kell.
Az AuthSCH-kliensnek át kell adnia a `pek.sch.bme.hu:profile` scope adatait.
Az aktív tagok és körvezetők beléphetnek; az öregtagok hozzáférése külön engedélyezhető.

Az első beállításkor, a környezeti változó megadása után inicializálni kell a körnevet
és az öregtagok szabályát. A parancs a backend `DATABASE_URL` célját módosítja:

```bash
cd apps/backend
yarn access:configure --group-name "A kör neve"
yarn access:configure --show
```

A **Kör adminisztráció → Hozzáférés** fülön a kör-ID csak olvasható. A megjelenített
körnév és az öregtagok engedélyezése szerkeszthető `canManageSettings` vagy helyi
körvezetői jogosultsággal. Minden mentés megerősítő modalt nyit a pontos változással.
A Mégse gomb, az Escape és a modal bezárása nem ment. A körtagság önmagában nem ad adminjogot:
az első admin legyen jogosult körtag, megfelelő helyi szerepkörrel.

**Helyreállítás:** hibás kör-ID esetén javítsd az `AUTHSCH_GROUP_ID` értékét, és indítsd
újra a backendet. Ha az öregtagok szabálya vagy a tárolt konfiguráció miatt van kizárás,
az üzemeltető a fenti parancsot `--replace` kapcsolóval használhatja. Az
`--allow-alumni` engedélyezi az öregtagokat; nélküle tiltottak. A parancs nem hoz létre
felhasználót és nem módosít helyi szerepköröket. Kör-ID átadására nincs CLI-kapcsoló.

A munkamenet **7 napos**, automatikus AuthSCH-tokenfrissítés nincs. Minden új belépés
friss AuthSCH-profilt ellenőriz. A PÉK-tagság megszűnése a következő belépéskor, legfeljebb
a 7 napos helyi munkamenet lejárta után érvényesül, az AuthSCH adatfrissítésének esetleges
késésével. Az öregtag-szabály módosítása a következő védett kérésnél minden régi munkamenetet
elutasít; körnév-változás nem. A JWT-ben szereplő kör-ID-nak egyeznie kell az env-ben rögzített ID-val.

A meglévő `SystemSetting` tábla csak a megjelenített nevet, az öregtag-szabályt és a
verziókat tárolja a `groupAccess` kulcs alatt; sémamigráció nem szükséges.
Indítás előtt kötelező beállítani az env-változót; az adatbázisban tárolt kör-ID
nem írhatja felül a környezeti változót.
A korábbi felhasználók és munkaidőnaplók megmaradnak. Új telepítésnél ellenőrizni kell a
scope tényleges átadását jogosult és nem jogosult AuthSCH-fiókkal.
