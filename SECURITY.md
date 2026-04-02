# Security Policy

## Purpose

Gon Exposing is designed for static analysis and safe triage.

The backend is intended to:

- receive bytes
- calculate hashes
- extract strings
- detect indicators of compromise
- inspect PE metadata
- correlate suspicious behavior
- query outside services only when explicitly enabled

## Current guarantees

In the current implementation:

- uploaded samples are not executed on the host
- the backend does not invoke shell commands to open samples
- the backend does not perform local debugging, injection, or sandbox execution
- the backend does not send messages to detected third-party webhooks
- the backend does not perform flood, takedown, or destructive network actions

## Sample retention

Without Celery:

- uploads are kept in memory only for the time required by the analysis flow
- temporary local files are used only for static parsing and removed at the end of the process

With Celery:

- uploads may be stored temporarily on disk for the worker pipeline
- when `DELETE_UPLOAD_AFTER_ANALYSIS=true`, the worker removes the uploaded file after analysis

## External network access

The application only performs outside lookups when `ENABLE_THREAT_INTEL=true`.

When enabled, the backend may query:

- VirusTotal
- MalwareBazaar
- URLhaus
- other explicitly configured enrichment providers

If you want a fully offline mode:

- keep `ENABLE_THREAT_INTEL=false`
- keep `ENABLE_YARA=false` if you do not have a local YARA runtime configured

## Recommended hardening

- run the backend in an isolated environment
- use a non-privileged service account
- keep logs and databases outside sample-sharing folders
- do not add execution features without strong sandbox isolation
- treat every upload as hostile input
- review dependencies regularly
- purge local uploads and results on a schedule

## Responsible disclosure

If you find a security issue in this repository:

- do not publish destructive proof-of-concept material
- document the impact clearly
- include reproduction steps
- mention affected versions or commit ranges when possible

## Scope note

This policy describes the current behavior of this repository.

If future dynamic-analysis features are added, they must preserve:

- strong isolation
- execution outside the main host
- explicit operator opt-in
- updated risk documentation
