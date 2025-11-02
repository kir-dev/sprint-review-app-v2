# Sprint Review App - Frontend

Modern React frontend with Tailwind CSS for the Sprint Review application.

## Tech Stack

- ⚛️ **React 19** - UI library
- 🎨 **Tailwind CSS 4** - Utility-first CSS framework
- 🚀 **Vite 5** - Fast build tool
- 📍 **React Router 7** - Client-side routing
- 📘 **TypeScript** - Type safety

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Frontend runs on `http://localhost:3001`

## Build

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

## Features

- 🔐 AuthSCH authentication flow
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 🔒 Protected routes
- 📊 Dashboard with statistics
- 🌐 API integration with backend

## Environment

The frontend connects to the backend at `http://localhost:3000` via Vite proxy configuration.

Backend API endpoints are proxied:
- `/auth/*` → Backend auth endpoints
- `/api/*` → Backend API endpoints
