# School Admin API

A teacher administration system built with NestJS (backend) and Next.js (frontend). Teachers can register students, find common students, suspend students, and retrieve notification recipients.

## Hosted API

| Service | URL |
|---|---|
| Frontend | https://admin-school-assignment.vercel.app |
| Backend API | https://admin-school-assignment-production.up.railway.app |
| Swagger docs (API) | https://admin-school-assignment-production.up.railway.app/api/docs |

<video controls src="Screen Recording 2026-03-21 at 10.35.41 PM.mov" title="Title"></video>

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for MySQL)
- [pnpm](https://pnpm.io/) (for frontend)

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

This starts MySQL 8.0 on port `3306` and Adminer (DB UI) on port `8080`.

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

The default `.env` values work out of the box with the Docker setup.

### 3. Run database migrations

```bash
cd backend
npm install
npx prisma migrate deploy
```

### 4. Start both servers

From the **root** directory:

```bash
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger docs | http://localhost:3001/api/docs |
| Adminer (DB UI) | http://localhost:8080 |

---

## Running individually

### Backend only

```bash
cd backend
npm run start:dev
```

### Frontend only

```bash
cd frontend
pnpm run dev
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/register` | Register one or more students to a teacher |
| `GET` | `/api/commonstudents` | Get students registered to all given teachers |
| `POST` | `/api/suspend` | Suspend a student |
| `POST` | `/api/retrievefornotifications` | Get notification recipients |
| `GET` | `/api/students` | (Extra API) List all students with status and teachers (paginated) |

Full interactive documentation is available at `http://localhost:3001/api/docs` when running locally, or at https://admin-school-assignment-production.up.railway.app/api/docs for the hosted API.

---

## Running Tests

```bash
cd backend
npm test              # run all unit tests
npm run test:cov      # with coverage report
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `mysql://school_user:school_password@localhost:3306/school_db` | MySQL connection string |
| `PORT` | `3001` | Backend server port |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated allowed CORS origins |

---

## Deployment

### Backend → Railway

1. Create a [Railway](https://railway.app) account and create a new project
2. Add a **MySQL** plugin to the project (Railway sets `DATABASE_URL` automatically)
3. Connect your GitHub repository and select the `backend` folder as the root
4. Railway will use `railway.json` — no extra config needed
5. Set these environment variables in the Railway dashboard:

| Variable | Value |
|---|---|
| `ALLOWED_ORIGINS` | Your Vercel frontend URL, e.g. `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |

> `DATABASE_URL` and `PORT` are set automatically by Railway.

### Frontend → Vercel

1. Import the repository on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set this environment variable in Vercel:

| Variable | Value |
|---|---|
| `BACKEND_URL` | Your Railway backend URL, e.g. `https://your-backend.up.railway.app` |

---

## Tech Stack

- **Backend**: NestJS, Prisma ORM, MySQL 8, class-validator, Swagger
- **Frontend**: Next.js 16, React Hook Form, Axios, Tailwind CSS
- **Testing**: Jest, @nestjs/testing (unit tests, no DB required)
- **Infrastructure**: Docker Compose (MySQL + Adminer) / Railway + Vercel (production)
