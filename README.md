# Code Sync — Backend

The server-side API for **Code Sync**, a real-time collaborative coding platform. Built with [NestJS](https://nestjs.com/) and TypeScript, it handles authentication, user management, collaborative sessions, and real-time chat.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js) |
| Language | TypeScript |
| Database | PostgreSQL (via TypeORM) |
| Auth | Clerk |
| Real-time Chat | Stream Chat |
| Background Jobs | Inngest |
| Containerization | Docker |

## Project Structure

```
src/
├── auth/        # Clerk-based authentication & guards
├── chat/        # Stream Chat integration
├── session/     # Collaborative coding session management
├── users/       # User entity, service & controller
├── lib/         # Shared utilities (Inngest client, etc.)
├── types/       # Shared TypeScript types
├── app.module.ts
└── main.ts
```

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account & API keys
- Stream Chat account & API keys
- Inngest account (for background jobs)

## Environment Variables

Create a `.env` file in the root of this directory. Required variables:

```env
# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=

# Clerk (Authentication)
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=

# Stream Chat
STREAM_API_KEY=
STREAM_API_SECRET=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

> **Note:** Never commit `.env` to version control. It is already listed in `.gitignore`.

## Setup

```bash
# Install dependencies
npm install
```

## Running the Server

```bash
# Development (watch mode)
npm run start:dev

# Standard start
npm run start

# Production
npm run start:prod
```

The API will be available at `http://localhost:5000` (or the port defined in `PORT`). All routes are prefixed with `/api`.

### Notable Endpoints

| Path | Description |
|---|---|
| `POST /api/inngest` | Inngest event handler (background jobs) |
| `/api/users/*` | User management |
| `/api/session/*` | Collaborative session management |
| `/api/chat/*` | Chat integration |

## Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker

A `Dockerfile` is included for containerized deployments. The app is also configured for deployment on [Fly.io](https://fly.io) via `fly.toml`.

```bash
# Build the image
docker build -t code-sync-backend .

# Run the container (pass env vars as needed)
docker run -p 5000:5000 --env-file .env code-sync-backend
```

## License

Private — all rights reserved.
