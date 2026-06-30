# StillUp

Distributed website monitoring system with multi-region health checks and real-time alerting.

Website: https://stillup.sh

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │────▶│  PostgreSQL │
│   (React)   │     │   (Elysia)  │     │  (Prisma)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                    ┌───────────┐
                    │   Redis   │
                    │  (BullMQ) │
                    └─────┬─────┘
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Worker   │    │ Worker   │    │ Worker   │
    │ us-east  │    │ eu-west  │    │ ap-south │
    └──────────┘    └──────────┘    └──────────┘
```

## Project Structure

```
still-up/
├── apps/
│   ├── client/          # React frontend (Vite + TanStack Query)
│   ├── server/          # Elysia API server + Alert worker
│   └── worker/          # BullMQ workers (one per region)
├── packages/
│   ├── database/        # Prisma schema + client
│   ├── shared/          # Redis queues, validation schemas
│   ├── ui/              # Shared UI components
│   └── typescript-config/
└── turbo.json
```

## Component Overview

### Server

Elysia REST API handling authentication, monitor CRUD, and job scheduling.

- `src/index.ts` - Entry point, middleware, route mounting
- `src/lib/auth.ts` - better-auth configuration
- `src/lib/scheduler.ts` - BullMQ job scheduling per region
- `src/lib/stats.ts` - Server-side stats aggregation
- `src/lib/resend.ts` - Email templates
- `src/alertWorker.ts` - Alert queue consumer

### Worker

Region-specific BullMQ workers. Each instance processes `checks|{region}` queue.

- `index.ts` - Queue consumer, HTTP checks, DB writes
- `lib/state-evaluator.ts` - Failure detection and alert triggering

### Client

React SPA with server-side aggregated stats.

- TanStack Query for data fetching
- Recharts for latency visualization
- Tailwind CSS styling

### Shared Package

- `redis.ts` - Queue definitions (3 regional + 1 alert)
- `validation.ts` - Zod schemas for API inputs

## Database Models

```
User ─┬─ Session
      ├─ Account
      ├─ Monitor ─┬─ Check
      │           ├─ MonitorState
      │           └─ AlertLog
      └─ NotificationSettings
```

**Monitor:** id, name, url, interval, regions[], isActive

**Check:** id, monitorId, status, responseTime, region, statusCode, createdAt

**MonitorState:** monitorId, globalStatus (UP/DOWN), lastEvaluatedAt, lastNotifiedAt

**AlertLog:** monitorId, type (DOWN/UP), email, success, error, createdAt

## Queue Architecture

**Check Queues:** `checks|us-east`, `checks|eu-west`, `checks|ap-south`

Jobs scheduled per monitor per region using `upsertJobScheduler`. Each job contains `{ monitorId, url }`.

**Alert Queue:** Single `alerts` queue. Jobs contain `{ monitorId, type, downRegions[], timestamp }`.

## State Evaluation Logic

1. Region is "down" if last 2 consecutive checks failed
2. Monitor is "DOWN" when `ceil(totalRegions / 2)` regions are down
3. Atomic transitions using `updateMany` with status condition
4. Alerts only fire on state change (UP→DOWN, DOWN→UP)
5. Job deduplication via `jobId: ${monitorId}-DOWN`

## Stats Aggregation

Server computes at request time:
- 50 windows x 3 minutes = 2.5 hours of timeline data
- Per-window region breakdown with status and latency
- Overall uptime percentage from all-time checks
- Latency buckets: 15min (day), 1hr (week), 4hr (month)

## Notification Flow

```
Worker stores Check → evaluateAndAlert() → atomic state update
    ↓ (if changed)
Alert Queue → Alert Worker → Resend email → AlertLog
```
