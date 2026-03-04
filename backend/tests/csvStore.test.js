import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createCsvStore } from '../src/csvStore.js';

describe('csvStore', () => {
  it('creates csv file and persists rows with commas/newlines', async () => {
    const csvPath = path.resolve('backend/tests/tmp/test-digestai.csv');
    await fs.rm(path.dirname(csvPath), { recursive: true, force: true });

    const store = await createCsvStore({ CSV_PATH: csvPath });
    await store.appendSummary(['2024-01-01', 'Title, One', 'text', 'Summary line 1\nSummary line 2', '']);

    const rows = await store.getRecentRows(10);
    expect(rows).toHaveLength(1);
    expect(rows[0][1]).toBe('Title, One');
    expect(rows[0][3]).toContain('Summary line 2');
  });
});
