import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

function loadDotEnv() {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env')
  ];

  const envPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (envPath) {
    dotenv.config({ path: envPath });
    return envPath;
  }

  dotenv.config();
  return null;
}

const loadedEnvPath = loadDotEnv();
const required = ['OPENAI_API_KEY', 'GOOGLE_SERVICE_ACCOUNT_JSON', 'SHEET_ID', 'SHEET_TAB'];

export function readEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    const fromPath = loadedEnvPath ? ` Loaded .env from: ${loadedEnvPath}.` : '';
    throw new Error(`Missing required environment variables: ${missing.join(', ')}.${fromPath}`);
  }

  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    SHEET_ID: process.env.SHEET_ID,
    SHEET_TAB: process.env.SHEET_TAB,
    PORT: Number(process.env.PORT || 8787)
  };
}
