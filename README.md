# DigestAI
Ingest & Get the gist.

DigestAI is a full-stack PWA with a React + Vite frontend and Node/Express backend.

## Features
- Text input + URL paste + image upload/paste + voice dictation (Web Speech API)
- URL preview scraping via backend proxy (paywall-free pages only)
- GPT-4o-mini summarization in strict format:
  - `Summary: ...`
  - `Facts:` bullet points
- Google Sheets append logging with service account (backend-only)
- History view (last 10 rows)
- Installable PWA for Android/iOS + desktop browsers
- Text-based SVG app icons (no binary assets)
- Error toast notifications

## Environment variables
Use **only** these variables:
- `OPENAI_API_KEY`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (supports raw multiline JSON or base64)
- `SHEET_ID`
- `SHEET_TAB`

See `.env.example`.

## Google Service Account setup
1. In Google Cloud Console, create/select a project.
2. Enable **Google Sheets API**.
3. Go to IAM & Admin → Service Accounts.
4. Create a service account and generate a JSON key.
5. Share the target Google Sheet with the service account email (`...@...iam.gserviceaccount.com`) as Editor.
6. Set `GOOGLE_SERVICE_ACCOUNT_JSON` with:
   - raw JSON (single-line or multiline), or
   - base64 encoded JSON.

## Run locally
```bash
npm install
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

## Test
```bash
npm run test
```

## API
- `POST /api/preview` body: `{ "url": "https://..." }`
- `POST /api/summarize` body: `{ title, inputType, rawInput, rawInputLink }`
- `GET /api/history`

## Deploy notes
This repo is deploy-ready for Vercel/Netlify in split mode:
- Frontend (`frontend/`) as static site build (`npm run build --workspace frontend`)
- Backend (`backend/`) as Node service (`npm run start --workspace backend`)
- Configure env vars on hosting platform.
