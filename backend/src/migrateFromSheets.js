import { createLegacySheetsClient, getAllLegacyRows } from './legacySheets.js';

function rowKey(row) {
  return row.map((item) => String(item ?? '')).join('||');
}

export async function migrateFromSheetsToCsv({ env, storage }) {
  if (!env.MIGRATE_FROM_SHEETS) {
    return { migrated: 0, skipped: true, reason: 'MIGRATE_FROM_SHEETS is disabled' };
  }

  const googleServiceAccountJson = env.LEGACY_GOOGLE_SERVICE_ACCOUNT_JSON || env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = env.LEGACY_SHEET_ID || env.SHEET_ID;
  const sheetTab = env.LEGACY_SHEET_TAB || env.SHEET_TAB;

  if (!googleServiceAccountJson || !sheetId || !sheetTab) {
    return { migrated: 0, skipped: true, reason: 'Legacy sheet env vars are not fully configured' };
  }

  const sheets = createLegacySheetsClient(googleServiceAccountJson);
  const legacyRows = await getAllLegacyRows({ sheets, sheetId, sheetTab });

  const existingRows = await storage.getAllRows();
  const existing = new Set(existingRows.map(rowKey));

  let migrated = 0;
  for (const row of legacyRows) {
    if (!row?.length) continue;

    const normalized = [row[0] || '', row[1] || '', row[2] || '', row[3] || '', row[4] || ''];
    if (normalized[0] === 'timestamp' && normalized[1] === 'title') continue;

    const key = rowKey(normalized);
    if (existing.has(key)) continue;

    await storage.appendSummary(normalized);
    existing.add(key);
    migrated += 1;
  }

  return { migrated, skipped: false, reason: null };
}
