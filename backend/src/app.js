import express from 'express';
import cors from 'cors';
import { summarizeInput } from './summarizer.js';
import { appendSummary, getRecentRows } from './sheets.js';
import { fetchPreviewText } from './scrape.js';

export function createApp(deps) {
  const { openai, sheets, env } = deps;
  const app = express();
  const api = express.Router();

  app.use(cors());
  app.use(express.json({ limit: '8mb' }));

  api.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  api.post('/preview', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'url is required' });
      const previewText = await fetchPreviewText(url);
      return res.json({ previewText });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  api.post('/summarize', async (req, res) => {
    try {
      const { title = 'Untitled', inputType, rawInput, rawInputLink } = req.body;
      if (!inputType || !rawInput) {
        return res.status(400).json({ error: 'inputType and rawInput are required' });
      }

      const summary = await summarizeInput({ openai, content: rawInput });
      const timestamp = new Date().toISOString();

      await appendSummary({
        sheets,
        SHEET_ID: env.SHEET_ID,
        SHEET_TAB: env.SHEET_TAB,
        row: [timestamp, title, inputType, summary, rawInputLink || '']
      });

      return res.json({ timestamp, summary });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  api.get('/history', async (_req, res) => {
    try {
      const rows = await getRecentRows({
        sheets,
        SHEET_ID: env.SHEET_ID,
        SHEET_TAB: env.SHEET_TAB,
        limit: 10
      });

      const mapped = rows.map((row) => ({
        timestamp: row[0] || '',
        title: row[1] || '',
        inputType: row[2] || '',
        inputSummary: row[3] || '',
        rawInputLink: row[4] || ''
      }));

      return res.json({ rows: mapped });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.use('/api', api);
  return app;
}
