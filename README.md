# Gon Exposing

[![License: MIT](https://img.shields.io/badge/license-MIT-111111?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-111111?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Next.js 16](https://img.shields.io/badge/next.js-16-111111?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-api-111111?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-optional-111111?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-optional-111111?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Static Analysis Only](https://img.shields.io/badge/analysis-static%20only-111111?style=for-the-badge)](SECURITY.md)
[![Language](https://img.shields.io/badge/language-EN%20default%20%7C%20PT--BR-111111?style=for-the-badge)](frontend/lib/translations.ts)

Gon Exposing is a static-first malware triage platform for files, URLs, and hashes. It focuses on safe inspection, IOC review, PE-aware analysis, risk scoring, optional threat-intel enrichment, and guided learning without executing uploaded samples on the host.

## Contents

- [Overview](#overview)
- [How the site works](#how-the-site-works)
- [Simple mode without external API keys](#simple-mode-without-external-api-keys)
- [Current scope](#current-scope)
- [Security model](#security-model)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Quick start on Windows](#quick-start-on-windows)
- [Manual run](#manual-run)
- [Docker run](#docker-run)
- [How to use the UI](#how-to-use-the-ui)
- [Authentication and internal API keys](#authentication-and-internal-api-keys)
- [External integrations and where to get keys](#external-integrations-and-where-to-get-keys)
- [Environment variables](#environment-variables)
- [Cleanup and local retention](#cleanup-and-local-retention)
- [Prevention and safe-use guidance](#prevention-and-safe-use-guidance)
- [Cybersecurity references](#cybersecurity-references)
- [Main API surface](#main-api-surface)
- [Learn Hub](#learn-hub)
- [Publishing to GitHub](#publishing-to-github)
- [Hosting options](#hosting-options)
- [Troubleshooting](#troubleshooting)
- [Roadmap snapshot](#roadmap-snapshot)
- [License](#license)

## Overview

Gon Exposing was built around a straightforward workflow:

1. Accept a suspicious file, URL, or hash.
2. Run static triage without executing the sample.
3. Extract strings and indicators.
4. Correlate suspicious behavior and PE metadata.
5. Produce a conservative risk score and report-ready output.
6. Suggest safe next steps for beginners through the Learn Hub.

The project is intentionally designed for people who want to inspect something before opening or executing it on their own machine.

## How the site works

The web app currently supports three input types:

- `FILE`: calculates hashes, extracts strings, detects IOC, maps behaviors, attempts PE analysis, and computes a local score.
- `URL`: treats the submitted URL as a static artifact, extracts IOC, correlates suspicious patterns, and does not execute remote content.
- `HASH`: looks up local context and optional external enrichment sources without downloading the matching sample.

Analysis results are shown in a structured report page with:

- live progress updates
- risk score
- IOC groups
- behavior findings with MITRE context
- PE sections and suspicious imports when relevant
- classified strings
- optional YARA and threat-intel enrichment
- learning suggestions for beginners

The platform can also expose a public threat feed backed by indexed reports instead of executable retention. That means people can browse and search high-risk reports without the service becoming a sample mirror.

## Simple mode without external API keys

The project remains useful even with no third-party API keys configured.

If you keep `ENABLE_THREAT_INTEL=false`, you still get:

- file analysis
- URL analysis
- hash lookup
- string extraction
- suspicious string classification
- webhook, URL, IP, domain, token, and path detection
- Telegram-related endpoint and token detection
- local behavior correlation
- local risk scoring
- PE-aware static analysis
- local search
- Learn Hub content

External API keys improve context, but they are not required for the platform to work in a simple, objective, self-hosted mode.

## Current scope

What is already implemented:

- Next.js frontend with English as the default language and PT-BR toggle support
- FastAPI backend
- file, URL, and hash workflows
- string extraction and classification
- IOC detection for webhooks, URLs, IPs, domains, tokens, registry-like paths, and Telegram artifacts
- static PE analysis with sections, entropy, suspicious imports, and packer hints
- unified local risk scoring
- optional enrichment through VirusTotal, MalwareBazaar, and URLhaus
- optional PostgreSQL, Redis, and Celery support
- local search and recent scan index
- public report feed for indexed high-risk analyses
- Learn Hub for guided follow-up

## Security model

Gon Exposing is built for static-only triage.

Current behavior:

- does not execute the sample on the host
- does not spawn shell commands to open uploaded artifacts
- does not send messages to detected third-party webhooks
- does not flood, disable, or tamper with third-party infrastructure
- treats submitted input as hostile data for parsing and correlation

By default, the useful long-lived artifact is the report, not the uploaded executable.

Read [SECURITY.md](SECURITY.md) for the project security policy.

## Architecture

```text
User
  -> Next.js frontend
      -> FastAPI backend
          -> Static analysis pipeline
              -> Hashing
              -> String extraction
              -> IOC detection
              -> Behavior correlation
              -> PE analysis
              -> Optional YARA
              -> Optional threat intel
          -> Local store or PostgreSQL
          -> WebSocket progress
          -> Optional Redis and Celery
```

## Repository layout

```text
backend/
  analyzers/
  models/
  rules/
  services/
  tools/
  main.py

frontend/
  app/
  components/
  lib/
  public/

docker/
docs/
assets/
```

## Quick start on Windows

Use the launcher from the repository root:

```cmd
cd .
run.cmd
```

Available modes:

```cmd
run.cmd dev
run.cmd prod
run.cmd dry-run
run.cmd help
```

The launcher:

- creates `.env` from `.env.example` when missing
- uses `.venv\Scripts\python.exe` when available
- installs backend dependencies if `uvicorn` is missing
- installs frontend dependencies if `node_modules` is missing
- opens backend and frontend in separate windows

## Manual run

### Requirements

- Python 3.11+
- Node.js 20+
- npm
- Docker Desktop if you want containers

### 1. Prepare the environment

```powershell
Copy-Item .env.example .env
```

Then edit `.env` with your local values.

### 2. Start the backend

```powershell
cd .
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend\requirements.txt -r backend\requirements-worker.txt
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start the frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

### 4. Open the app

- frontend: `http://localhost:3000`
- backend: `http://localhost:8000`
- health: `http://localhost:8000/health`

## Docker run

```powershell
cd .
docker compose -f docker/docker-compose.yml up --build
```

This starts:

- frontend
- backend
- PostgreSQL
- Redis
- Celery worker

## How to use the UI

### File tab

1. Open the home page.
2. Drop a file or click the upload area.
3. Submit the analysis.
4. Review score, IOC, behaviors, PE details, and strings.

### URL tab

1. Paste the suspicious URL.
2. Submit the URL analysis.
3. Review extracted endpoints, messaging references, IOC, and score.

### Hash tab

1. Paste an MD5, SHA1, SHA256, or SHA512 value.
2. Submit the lookup.
3. Review local context and optional enrichment.

### Search

Use the search area to query:

- filename
- hash
- family
- URL
- domain
- IOC

## Authentication and internal API keys

The backend supports:

- bootstrap-based first admin creation
- JWT login
- internal API keys for automation

Important variables:

- `JWT_SECRET`
- `BOOTSTRAP_TOKEN`
- `ALLOW_PUBLIC_REGISTRATION`

Example bootstrap request:

```powershell
$body = @{
  email = "admin@example.com"
  password = "StrongPass123!"
  display_name = "Gon Admin"
  bootstrap_token = "your-bootstrap-token"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8000/api/v1/auth/bootstrap" `
  -ContentType "application/json" `
  -Body $body
```

## External integrations and where to get keys

These integrations are optional.

| Service | Purpose | Key required | Official docs |
| --- | --- | --- | --- |
| VirusTotal | Hash and file reputation context | Yes | https://docs.virustotal.com/ |
| MalwareBazaar | Sample family and metadata enrichment | No for basic lookup | https://bazaar.abuse.ch/api/ |
| URLhaus | Malicious URL context | No for basic lookup | https://urlhaus.abuse.ch/api/ |
| AbuseIPDB | IP reputation enrichment | Yes | https://docs.abuseipdb.com/ |
| Shodan | Infrastructure enrichment | Yes | https://developer.shodan.io/api |
| Triage | Sandbox hash context and external workflow | Depends on usage | https://tria.ge/docs/ |

Where to obtain common API keys:

- VirusTotal: `https://www.virustotal.com/gui/my-apikey`
- AbuseIPDB: `https://www.abuseipdb.com/account/api`
- Shodan: `https://account.shodan.io/`

## Environment variables

Core variables:

- `NEXT_PUBLIC_API_URL`
- `BACKEND_CORS_ORIGINS`
- `MAX_UPLOAD_SIZE_MB`
- `JWT_SECRET`
- `JWT_EXPIRES_MINUTES`
- `BOOTSTRAP_TOKEN`
- `ALLOW_PUBLIC_REGISTRATION`
- `ENABLE_YARA`
- `ENABLE_THREAT_INTEL`
- `DATABASE_URL`
- `REDIS_URL`
- `DELETE_UPLOAD_AFTER_ANALYSIS`

Current branding and project identity are intentionally kept in code instead of environment variables.

Main branding files:

- [site.ts](frontend/lib/site.ts)
- [analysis_pipeline.py](backend/services/analysis_pipeline.py)

## Cleanup and local retention

To prevent local storage growth, use the cleanup helper:

```cmd
cd .
wipe.cmd --target all --dry-run
wipe.cmd --target uploads
wipe.cmd --target results --older-than-days 7
```

This only touches local storage under `backend/data`.

## Prevention and safe-use guidance

Recommended operator behavior:

- never execute suspicious samples on your main machine
- review hashes before sharing files
- analyze inside a VM if you need deeper manual work
- keep enrichment optional if you want an offline-first workflow
- treat uploads as hostile
- review retention and logs regularly

Recommended beginner workflow:

1. Submit the file or URL.
2. Read the score and IOC before touching the sample.
3. If the score is high, stop and move to a safe lab workflow.
4. Use the Learn Hub before attempting manual reverse engineering.

## Cybersecurity references

Operational references:

- CISA Alerts: https://www.cisa.gov/news-events/cybersecurity-advisories
- CISA Known Exploited Vulnerabilities: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- CISA Shields Up: https://www.cisa.gov/shields-up
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CIS Benchmarks: https://www.cisecurity.org/cis-benchmarks
- Microsoft Threat Intelligence Blog: https://www.microsoft.com/en-us/security/blog/topic/threat-intelligence/
- MalwareBazaar: https://bazaar.abuse.ch/
- URLhaus: https://urlhaus.abuse.ch/
- VirusTotal: https://www.virustotal.com/
- Triage: https://tria.ge/
- Any.Run: https://app.any.run/

## Main API surface

Main routes:

- `POST /api/v1/analyze/file`
- `POST /api/v1/analyze/url`
- `POST /api/v1/analyze/hash`
- `GET /api/v1/results/{task_id}`
- `GET /api/v1/scans/recent`
- `GET /api/v1/search`
- `GET /api/v1/feed`
- `GET /health`
- `WS /ws/analysis/{task_id}`

See also:

- [docs/api.md](docs/api.md)
- [docs/deployment.md](docs/deployment.md)

## Learn Hub

The Learn Hub is available inside the frontend and is meant to help people go beyond the automated report safely.

Current learning tracks include:

- basics
- safe environment setup
- Ghidra
- dnSpy
- YARA
- dynamic analysis references
- Python helpers
- glossary and labs

## Hosting options

Practical hosting options:

- GitHub for source control
- Vercel for the frontend
- Render, Railway, Fly.io, or a VPS for the backend
- a VPS with Docker Compose for self-hosting
- a private internal network if you want offline-first usage

Good fit for this stack:

- GitHub + Vercel + Render
- GitHub + Docker Compose + VPS
- local lab machine + Docker Desktop

## Troubleshooting

### Frontend cannot reach the backend

Check:

- `NEXT_PUBLIC_API_URL`
- backend process is running
- `http://localhost:8000/health`

### Launcher opens but backend fails

Run:

```cmd
run.cmd dry-run
```

If your virtual environment exists but dependencies are missing, the launcher now installs them automatically.

### WebSocket progress is unavailable

The result page falls back to polling. The report still works, but live updates may be limited if the backend is missing the WebSocket runtime or the connection is interrupted.

### The app feels slow in development

Use the production frontend for a more realistic experience:

```powershell
cd frontend
npm.cmd run build
npm.cmd start
```


## License

This project is distributed under the [MIT License](LICENSE).
