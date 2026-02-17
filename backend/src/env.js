import dotenv from 'dotenv';

dotenv.config();

const required = ['OPENAI_API_KEY', 'GOOGLE_SERVICE_ACCOUNT_JSON', 'SHEET_ID', 'SHEET_TAB'];

export function readEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    SHEET_ID: process.env.SHEET_ID,
    SHEET_TAB: process.env.SHEET_TAB,
    PORT: Number(process.env.PORT || 8787)
  };
}
