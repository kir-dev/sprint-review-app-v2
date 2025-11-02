# Sprint Review App

## Description

Sprint Review Application - A NestJS backend for managing projects, work periods, logs, and user authentication via AuthSCH.

## Features

- 🔐 **AuthSCH Authentication** - BME SSO integration
- 👥 **User Management** - CRUD operations for users
- 📁 **Project Management** - Track projects and team members
- ⏱️ **Work Periods** - Manage sprint periods
- 📝 **Logging System** - Track work logs with statistics
- 📚 **Swagger Documentation** - Interactive API docs at `/api`
- ⚛️ **React Frontend** - Modern UI with Tailwind CSS

## Project setup

### Backend Setup

```bash
# Install backend dependencies
$ yarn install

# Setup environment variables
$ cp .env.example .env
# Edit .env with your AuthSCH credentials and database URL

# Setup database
$ yarn prisma migrate dev
$ yarn prisma db seed
```

### Frontend Setup

```bash
# Navigate to frontend directory
$ cd frontend

# Install frontend dependencies
$ yarn install
```

## AuthSCH Configuration

1. Register your application at [https://auth.sch.bme.hu/console/create](https://auth.sch.bme.hu/console/create)
2. Set the callback URL to: `http://localhost:3000/auth/callback`
3. Copy your Client ID and Client Secret to `.env`:
   ```bash
   AUTHSCH_CLIENT_ID=your_client_id_here
   AUTHSCH_CLIENT_SECRET=your_client_secret_here
   JWT_SECRET=your_random_jwt_secret_here
   FRONTEND_URL=http://localhost:3000
   ```

## Run the application

### Backend (NestJS)

```bash
# development mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

Backend runs on `http://localhost:3001`

### Frontend (React + Vite)

```bash
# Navigate to frontend directory
$ cd frontend

# development mode
$ yarn dev
```

Frontend runs on `http://localhost:3000`

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Application Structure

```
backend/
├── src/
│   ├── auth/              # AuthSCH + JWT authentication
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