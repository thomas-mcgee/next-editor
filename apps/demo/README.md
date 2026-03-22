# @makeablebrand/next-editor demo

The demo app exercises the `@makeablebrand/next-editor` package against a real Next.js app. It uses the same public API a downstream project would use — no internal shortcuts.

## Setup

### 1. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string (Neon, Supabase, Railway, local, etc.) |
| `AUTH_SECRET` | Yes | Random secret for NextAuth JWTs — `openssl rand -base64 32` |
| `B2_ENDPOINT` | No | Backblaze B2 S3 endpoint URL |
| `B2_REGION` | No | B2 region (e.g. `us-west-002`) |
| `B2_BUCKET_NAME` | No | B2 bucket name |
| `B2_APPLICATION_KEY_ID` | No | B2 app key ID |
| `B2_APPLICATION_KEY` | No | B2 app key secret |
| `B2_PUBLIC_BASE_URL` | No | Public base URL for uploaded images |

B2 variables are optional — image fields show a URL input fallback when they are not set.

### 2. Database

No migration or seed step is required for auth/admin setup. `@makeablebrand/next-editor` creates its `ne_users`, `ne_content`, and `ne_collection_entries` tables automatically on first run.

### 3. Build the package

The demo consumes the workspace package directly. Build it before starting the dev server:

```bash
npm run build --workspace=@makeablebrand/next-editor
```

### 4. Start

From the repo root:

```bash
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin). On first run, the package will show `/admin/setup` so you can create the first administrator account.
