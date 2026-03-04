import fs from 'node:fs/promises';
import path from 'node:path';

const HEADER = ['timestamp', 'title', 'input_type', 'input_summary', 'raw_input_link_if_any'];

function escapeCsvCell(value) {
  const text = String(value ?? '');
  if (/[,"\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function rowToCsvLine(row) {
  return row.map(escapeCsvCell).join(',');
}

function parseCsv(content) {
  const rows = [];
  let cell = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(cell);
      cell = '';
      continue;
    }

    if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    if (char === '\r') continue;
    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

async function ensureCsv(csvPath) {
  await fs.mkdir(path.dirname(csvPath), { recursive: true });
  try {
    await fs.access(csvPath);
  } catch {
    await fs.writeFile(csvPath, `${rowToCsvLine(HEADER)}\n`, 'utf8');
  }
}

export async function createCsvStore({ CSV_PATH }) {
  const csvPath = path.resolve(CSV_PATH || './data/digestai.csv');
  await ensureCsv(csvPath);

  async function getAllRows() {
    const content = await fs.readFile(csvPath, 'utf8');
    const rows = parseCsv(content);
    if (!rows.length) return [];

    const [first, ...rest] = rows;
    const firstLooksLikeHeader = first[0] === HEADER[0] && first[1] === HEADER[1];
    return firstLooksLikeHeader ? rest : rows;
  }

  return {
    path: csvPath,
    async appendSummary(row) {
      await fs.appendFile(csvPath, `${rowToCsvLine(row)}\n`, 'utf8');
    },
    async getRecentRows(limit = 10) {
      const rows = await getAllRows();
      return rows.slice(-limit).reverse();
    },
    async getAllRows() {
      return getAllRows();
    }
  };
}
