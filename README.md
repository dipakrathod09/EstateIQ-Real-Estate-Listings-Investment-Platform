# EstateIQ — Real Estate Listings & Investment Platform

EstateIQ is an end-to-end real estate listings and investment analytics platform built with Django REST Framework, React (Vite), and a FastAPI machine learning microservice. It provides real-time property management, automated price valuations, user role management (Buyers, Owners, Agents, Builders, Admins), and scalable containerized infrastructure.

---

## Prerequisites

Before starting, ensure you have the following installed on your host machine:

- **Docker & Docker Compose**: Docker Desktop 4.x+ (Engine 24.x+)
- **Node.js**: v20.x+ (if running frontend outside Docker)
- **Python**: 3.11+ (if running backend or ML microservice outside Docker)

---

## Quick Start (Local Development)

### 1. Clone & Environment Setup

```bash
git clone https://github.com/your-org/estateiq.git
cd estateiq

# Copy environment variable template
cp .env.example .env
```

### 2. Launch Services with Docker Compose

```bash
docker-compose up --build
```

This starts all four services in parallel:
- **PostgreSQL Database** (`db`): `localhost:5432`
- **Django REST Backend** (`backend`): `localhost:8000`
- **React Frontend** (`frontend`): `localhost:5173`
- **FastAPI ML Service** (`ml-service`): `localhost:8001`

---

## Service Endpoints & Health Checks

| Service | Access URL | Health Check / API Endpoint |
|---|---|---|
| **React Frontend** | [http://localhost:5173](http://localhost:5173) | Integrated live health monitor on Home page |
| **Django Backend API** | [http://localhost:8000/api/health/](http://localhost:8000/api/health/) | Returns `{"status": "ok"}` |
| **Django Admin** | [http://localhost:8000/admin/](http://localhost:8000/admin/) | Admin panel with Custom User Role management |
| **FastAPI ML Microservice** | [http://localhost:8001/health](http://localhost:8001/health) | Returns `{"status": "ok"}` |
| **ML Price Prediction API** | `POST http://localhost:8001/predict-price` | Valuations endpoint |

---

## Database Migrations & Superuser Setup

### Run Django Migrations

Execute initial migrations to set up tables for custom User model (`users.User`), listings, investments, and leads:

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### Create Django Admin Superuser

Create an admin account to log into [http://localhost:8000/admin/](http://localhost:8000/admin/):

```bash
docker-compose exec backend python manage.py createsuperuser
```

Follow the prompts to enter username, email, and password.

---

## Project Monorepo Structure

```
EstateIQ/
├── backend/                  # Django REST Framework API & core domain models
│   ├── core/                 # Settings, root URLs, WSGI/ASGI, health view
│   ├── users/                # Custom User model (role: buyer, owner, agent, builder, admin)
│   ├── listings/             # Property listings app
│   ├── investments/          # Investment analytics app
│   └── leads/                # Lead tracking app
├── frontend/                 # React 18 + Vite + Tailwind CSS SPA
│   ├── src/api/client.js     # Axios client with JWT interceptor
│   ├── src/pages/            # Home, Search, PropertyDetails, Login, Dashboard
│   └── src/components/       # UI components & Navigation
├── ml-service/               # FastAPI microservice for price prediction
│   └── main.py               # /health and /predict-price endpoints
├── .github/workflows/ci.yml  # GitHub Actions parallel CI workflow
├── docker-compose.yml        # Local dev container orchestration
├── .env.example              # Environment variables template
└── README.md                 # Project documentation
```

---

## Running CI & Tests Locally

### Backend Tests

```bash
cd backend
python -m pytest
```

### Frontend Build Check

```bash
cd frontend
npm run build
```
