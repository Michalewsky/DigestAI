import { google } from 'googleapis';

function decodeServiceAccount(raw) {
  try {
    const normalized = raw.trim();
    if (normalized.startsWith('{')) return JSON.parse(normalized);
    return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
  } catch (error) {
    throw new Error('Unable to parse GOOGLE_SERVICE_ACCOUNT_JSON as multiline JSON or base64 JSON');
  }
}

export function createSheetsClient({ GOOGLE_SERVICE_ACCOUNT_JSON }) {
  const creds = decodeServiceAccount(GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
}

export async function appendSummary({ sheets, SHEET_ID, SHEET_TAB, row }) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A:E`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row]
    }
  });
}

export async function getRecentRows({ sheets, SHEET_ID, SHEET_TAB, limit = 10 }) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A:E`
  });

  const values = response.data.values ?? [];
  return values.slice(-limit).reverse();
}
