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