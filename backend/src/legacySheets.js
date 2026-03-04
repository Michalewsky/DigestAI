import { google } from 'googleapis';

function decodeServiceAccount(raw) {
  try {
    const normalized = raw.trim();
    if (normalized.startsWith('{')) return JSON.parse(normalized);
    return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
  } catch {
    throw new Error('Unable to parse legacy service account JSON (raw or base64).');
  }
}

export function createLegacySheetsClient(googleServiceAccountJson) {
  const creds = decodeServiceAccount(googleServiceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  return google.sheets({ version: 'v4', auth });
}

export async function getAllLegacyRows({ sheets, sheetId, sheetTab }) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetTab}!A:E`
  });

  return response.data.values ?? [];
}
