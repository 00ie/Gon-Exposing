# API

## Auth

### `POST /api/v1/auth/bootstrap`

Creates the first admin account when the instance has no users yet.

### `POST /api/v1/auth/register`

Creates an analyst account when `ALLOW_PUBLIC_REGISTRATION=true`.

### `POST /api/v1/auth/login`

Returns a bearer token for UI or API usage.

### `GET /api/v1/auth/me`

Returns the current authenticated user.

### `GET /api/v1/auth/api-keys`

Lists the caller's API keys.

### `POST /api/v1/auth/api-keys`

Creates a new API key. The plaintext key is returned only once.

### `DELETE /api/v1/auth/api-keys/{key_id}`

Revokes an existing API key owned by the caller.

## `POST /api/v1/analyze/file`

Uploads a sample and queues a static analysis task.

Response:

```json
{
  "task_id": "uuid",
  "status": "queued",
  "estimated_time_seconds": 25,
  "websocket_url": "/ws/analysis/uuid"
}
```

## `GET /api/v1/results/{task_id}`

Returns the current task status or the completed analysis result.

Result payloads may now include:

- `yara`
- `enrichment`

## `GET /api/v1/scans/recent`

Returns recent scans. Supports:

- `limit`
- `own_only=true` when authenticated

## `GET /api/v1/feed`

Returns the public high-risk report feed.

Supports:

- `limit`
- `q` for public search across indexed reports

The feed is designed to expose report metadata and report links without turning the service into an executable distribution point.

## `GET /health`

Simple healthcheck with exposed project contact metadata and auth posture.

## `WS /ws/analysis/{task_id}`

Streams progress snapshots while the analysis is running.

## Notes

- The current MVP is static only and does not execute uploaded content.
- Report actions are generated for official review instead of sending traffic to detected webhooks.
- Auth accepts either `Authorization: Bearer <token>` or `x-api-key: <key>`.
- YARA and threat-intel enrichment are optional and controlled by environment flags.
