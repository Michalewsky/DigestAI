import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('API', () => {
  it('summarizes and appends to storage', async () => {
    const openai = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({ choices: [{ message: { content: 'Summary: x\nFacts:\n- a' } }] })
        }
      }
    };

    const storage = {
      appendSummary: vi.fn().mockResolvedValue({}),
      getRecentRows: vi.fn().mockResolvedValue([])
    };

    const app = createApp({ openai, storage });
    const res = await request(app).post('/api/summarize').send({
      title: 'T',
      inputType: 'text',
      rawInput: 'Hello'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toContain('Summary:');
    expect(storage.appendSummary).toHaveBeenCalledOnce();
  });

  it('returns history', async () => {
    const openai = { chat: { completions: { create: vi.fn() } } };
    const storage = {
      appendSummary: vi.fn(),
      getRecentRows: vi.fn().mockResolvedValue([['2024', 'Title', 'text', 'Summary: y', '']])
    };

    const app = createApp({ openai, storage });
    const res = await request(app).get('/api/history');

    expect(res.statusCode).toBe(200);
    expect(res.body.rows).toHaveLength(1);
    expect(res.body.rows[0].title).toBe('Title');
  });

  it('root route reports backend status', async () => {
    const openai = { chat: { completions: { create: vi.fn() } } };
    const storage = { appendSummary: vi.fn(), getRecentRows: vi.fn().mockResolvedValue([]) };

    const app = createApp({ openai, storage });
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
