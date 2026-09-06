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

- Node.js 20+
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
# - FRONTEND_URL (default: http://localhost:3000)
```

### Database Setup

```bash
# Run migrations
cd apps/backend
yarn prisma migrate dev

# Seed database (optional)
yarn prisma db seed
```

## Development

Run backend and frontend separately:

```bash
# Start backend (runs on http://localhost:3001)
yarn start:backend

# Start frontend (runs on http://localhost:3000)
yarn start:frontend
```

## Build

```bash
# Build backend
yarn build:backend

# Build frontend
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

- Visit `http://localhost:3000` - React Frontend (Login/Dashboard)
- Visit `http://localhost:3001/api` - Swagger API documentation
- Backend API runs on `http://localhost:3001`

### Authentication Flow

1. User clicks "Login with AuthSCH" → redirects to `/auth/login`
2. AuthSCH authenticates → redirects to `/auth/callback`
3. Backend generates JWT → redirects to `/dashboard.html?jwt=<token>`
4. Frontend stores JWT in localStorage
5. All API requests use `Authorization: Bearer <token>` header
## Körtagsági hozzáférés (AuthSCH / PÉK)

Egy telepítést egy kör használ. A hozzáférés alapja kizárólag a backend
`AUTHSCH_GROUP_ID` környezeti változója; az adminfelület és az API nem módosíthatja.
A szükséges érték a **kör** számszerű PÉK-azonosítója, nem a felhasználó személyes PÉK-ID-ja.
Hiányzó vagy hibás értékkel a backend nem indul el. Példa a 106-os körhöz:

```dotenv
AUTHSCH_GROUP_ID=106
```

A változót az `apps/backend/.env` fájlban vagy a telepítési környezetben kell megadni.
Docker Compose esetén a gyökér `.env` fájljából kerül a backend konténerbe.
A változtatás backend-újraindítást igényel. A frontendhez nem kell `NEXT_PUBLIC_` változat.
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
