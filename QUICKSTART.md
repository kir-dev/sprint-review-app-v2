# Sprint Review App - Gyors Útmutató

## 🚀 Gyors Indítás

### 1. Backend indítása (NestJS)

```bash
# Terminal 1
yarn start:dev
```

Backend elérhető: `http://localhost:3001`
API Dokumentáció: `http://localhost:3001/api`

### 2. Frontend indítása (React + Vite)

```bash
# Terminal 2
yarn dev
```

Frontend elérhető: `http://localhost:3000`

## 📋 Következő lépések

1. **Konfiguráld az AuthSCH-t**:
   - Regisztráld az appot: https://auth.sch.bme.hu/console/create
   - Callback URL: `http://localhost:3000/auth/callback`
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

1. User → `/login` (React oldal)
2. Click "Bejelentkezés AuthSCH-val"
3. → `http://localhost:3000/auth/login` (Backend)
4. → AuthSCH login page
5. User bejelentkezik
6. → `http://localhost:3000/auth/callback` (Backend)
7. Backend generál JWT tokent
8. → `http://localhost:3001/login?jwt=<token>` (Frontend)
9. Frontend elmenti JWT-t localStorage-ba
10. → `/dashboard` (Protected route)

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

Swagger dokumentáció: `http://localhost:3001/api`

**Auth:**
- GET `/auth/login` - AuthSCH login
- GET `/auth/callback` - OAuth callback
- GET `/auth/me` - Current user (protected)

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
