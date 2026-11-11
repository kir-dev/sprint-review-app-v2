# Sprint Review App - Gyors Útmutató

## 🚀 Gyors Indítás

```bash
yarn dev
```

Az alkalmazás: `http://localhost:3000`. Az API külön szerveren fut (`:3001`), de a
`next dev` a `/api/*` kéréseket továbbítja neki, így a böngésző egyetlen címet lát.
API-dokumentáció: `http://localhost:3000/api/docs` (`ENABLE_SWAGGER=true` mellett).

## 📋 Következő lépések

1. **Konfiguráld az AuthSCH-t**:
   - Regisztráld az appot: https://auth.sch.bme.hu/console/create
   - Callback URL: `http://localhost:3000/api/auth/callback`
   - Másold a credentials-eket a `.env` fájlba

2. **Teszteld az alkalmazást**:
   - Nyisd meg: http://localhost:3000
   - Kattints a "Bejelentkezés AuthSCH-val" gombra
   - Jelentkezz be BME/SCH accountoddal
   - Átirányít a dashboardra

## 🏗️ Projekt Struktúra

```
sprint-review-app-v2/
├── src/                          # Backend (NestJS)
│   ├── auth/                     # AuthSCH + JWT auth
│   ├── users/                    # User CRUD
│   ├── projects/                 # Project CRUD
│   ├── work-periods/             # Work periods CRUD
│   └── logs/                     # Logs CRUD
│
└── frontend/                     # Frontend (React + Tailwind)
    ├── src/
    │   ├── pages/
    │   │   ├── Login.tsx         # Login oldal
    │   │   └── Dashboard.tsx     # Dashboard oldal
    │   ├── components/
    │   │   └── ProtectedRoute.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx   # Auth state management
    │   └── App.tsx               # Main app + routing
    └── package.json
```

## ⚙️ Technológiák

**Backend:**
- NestJS 11
- Prisma ORM
- PostgreSQL
- AuthSCH + JWT
- Swagger/OpenAPI

**Frontend:**
- React 19
- TypeScript
- Tailwind CSS 4
- Vite 5
- React Router 7

## 🔒 Authentikáció Flow

1. User → `/login`
2. Click "Bejelentkezés AuthSCH-val" → `/api/auth/login`
3. → AuthSCH login page, a user bejelentkezik
4. → `/api/auth/callback`: az API ellenőrzi a körtagságot, és HttpOnly sütiben
   (`sprint-review-session`) beállítja a JWT-t
5. → `/login`, ahonnan a frontend a `/dashboard`-ra lép

## 📝 Hasznos Parancsok

```bash
# Backend
yarn start:dev          # Development mode
yarn build              # Build for production
yarn test               # Run tests
yarn prisma studio      # Open Prisma Studio

# Frontend
cd frontend
yarn dev                # Development mode
yarn build              # Build for production
yarn preview            # Preview production build
```

## 🌐 API Endpoints

Swagger dokumentáció: `http://localhost:3000/api/docs`. Minden útvonal az `/api` alatt van.

**Auth:**
- GET `/api/auth/login` - AuthSCH login
- GET `/api/auth/callback` - OAuth callback
- POST `/api/auth/logout` - Kijelentkezés
- GET `/api/auth/me` - Current user (protected)

**Users:**
- POST `/users` - Create user
- GET `/users` - List users
- GET `/users/:id` - Get user
- GET `/users/:id/projects` - User's projects
- GET `/users/:id/logs` - User's logs
- PATCH `/users/:id` - Update user
- DELETE `/users/:id` - Delete user

**Projects, WorkPeriods, Logs:**
- Teljes CRUD + extra endpoints (lásd Swagger)
