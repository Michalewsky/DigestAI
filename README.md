# DigestAI
Ingest & Get the gist.

DigestAI is a full-stack PWA with a React + Vite frontend and Node/Express backend.

## Features
- Text input + URL paste + image upload/paste + voice dictation (Web Speech API)
- URL preview scraping via backend proxy (paywall-free pages only)
- GPT-4o-mini summarization in strict format:
  - `Summary: ...`
  - `Facts:` bullet points
- Local CSV logging (backend-only) for summaries and history
- History view (last 10 rows)
- Installable PWA for Android/iOS + desktop browsers
- Text-based SVG app icons (no binary assets)
- Error toast notifications

## Environment variables
Required:
- `OPENAI_API_KEY`

Optional:
- `CSV_PATH` (default: `./data/digestai.csv`)
- `PORT` (default: `8787`)

Optional migration flags (from previous Google Sheets setup):
- `MIGRATE_FROM_SHEETS=true`
- `LEGACY_GOOGLE_SERVICE_ACCOUNT_JSON`
- `LEGACY_SHEET_ID`
- `LEGACY_SHEET_TAB`

See `.env.example`.

## Storage model (CSV)
DigestAI stores rows in a local CSV file with columns:
- A: timestamp
- B: title
- C: input_type
- D: input_summary
- E: raw_input_link_if_any

The backend auto-creates the file and parent folder if missing.

## Migration from old Google Sheets mode
If you used the prior version with Google Sheets storage:
1. Set `MIGRATE_FROM_SHEETS=true` in `.env`.
2. Fill `LEGACY_GOOGLE_SERVICE_ACCOUNT_JSON`, `LEGACY_SHEET_ID`, `LEGACY_SHEET_TAB`.
3. Start backend once. It will copy rows into CSV (deduplicated) and log the count.
4. Set `MIGRATE_FROM_SHEETS=false` after migration.

## Run locally
Create `.env` in the repository root (same folder as top-level `package.json`).

```bash
npm install
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787/api/health`
- Backend root status: `http://localhost:8787/`

## Test
```bash
npm run test
```

## API
- `POST /api/preview` body: `{ "url": "https://..." }`
- `POST /api/summarize` body: `{ title, inputType, rawInput, rawInputLink }`
- `GET /api/history`
- `GET /api/health`

## Deploy notes
This repo is deploy-ready for Vercel/Netlify in split mode:
- Frontend (`frontend/`) as static site build (`npm run build --workspace frontend`)
- Backend (`backend/`) as Node service (`npm run start --workspace backend`)
- Configure env vars on hosting platform.
- For serverless, prefer a persistent volume or external storage instead of local ephemeral filesystem.
