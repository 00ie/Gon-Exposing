# Deployment

## Local Docker

```bash
docker compose -f docker/docker-compose.yml up --build
```

## Recommended public hosting

- Vercel for the frontend
- Render, Railway, Fly.io, or a VPS for the backend
- PostgreSQL and Redis only when you actually need them

This project is not a great fit for an all-in-Vercel deployment because the backend depends on long-running API behavior, WebSocket progress, local retention logic, and optional worker-style processing.

## Environment

- `NEXT_PUBLIC_API_URL`: frontend API target
- `BACKEND_CORS_ORIGINS`: comma-separated allowed origins
- `MAX_UPLOAD_SIZE_MB`: upload cap in megabytes
- `AUTH_DB_PATH`: local SQLite path for users and API keys when PostgreSQL is not configured
- `JWT_SECRET`: signing secret for bearer tokens
- `JWT_EXPIRES_MINUTES`: bearer token TTL
- `BOOTSTRAP_TOKEN`: one-time bootstrap gate for the first admin
- `ALLOW_PUBLIC_REGISTRATION`: enables `/api/v1/auth/register`
- `ANONYMOUS_RATE_LIMIT_PER_HOUR`: upload rate for public callers
- `AUTHENTICATED_RATE_LIMIT_PER_HOUR`: upload rate for logged-in/API-key callers
- `DATABASE_URL`: optional PostgreSQL connection string for auth and indexed report storage
- `REDIS_URL`: optional Redis connection string for worker-related flows

## Current Scope

- FastAPI backend with local JSON-backed task persistence
- SQLite-backed identity store for users and API keys by default
- PostgreSQL-backed auth and scan index when `DATABASE_URL` is configured
- SQLite-backed scan index by default for recent-feed queries
- Next.js frontend with upload flow, result page, and WebSocket progress
- Static PE-aware analysis with string extraction, IOC detection, behavior mapping, and risk scoring
- Optional YARA scanning with bundled starter rules
- Optional external enrichment through VirusTotal, MalwareBazaar, and URLhaus
- Optional Celery worker mode with Redis
