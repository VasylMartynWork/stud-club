# Stud Club — студентський клуб

Вебзастосунок студентського клубу з блогом, подіями, коментарями та системою лайків.

## Стек

| Частина | Технології |
|---------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Fastify, Drizzle ORM, PostgreSQL, JWT |
| Інфраструктура | Docker Compose (PostgreSQL) |

## Структура репозиторію

```
stud-club/
├── frontend/     # React SPA
├── backend/      # Fastify API
└── pnpm-workspace.yaml
```

## Передумови

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) та Docker Compose

## Швидкий старт

### 1. Клонування та залежності

```bash
pnpm install
```

### 2. Змінні середовища

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. База даних

```bash
docker compose -f backend/docker-compose.yml up -d
```

Перевірка:

```bash
docker compose -f backend/docker-compose.yml ps
```

Міграції та початкові дані:

```bash
pnpm --filter stud-club-backend db:migrate
pnpm --filter stud-club-backend db:seed
```

### 4. Backend

```bash
pnpm --filter stud-club-backend dev
```

API буде доступний на `http://localhost:3000`.

Swagger UI: `http://localhost:3000/docs`

OpenAPI JSON: `http://localhost:3000/docs/json`

### 5. Frontend

```bash
pnpm --filter frontend dev
```

Додаток буде доступний на `http://localhost:5173`.
