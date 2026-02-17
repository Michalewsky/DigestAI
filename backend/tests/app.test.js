import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('API', () => {
  const env = { SHEET_ID: 'sheet', SHEET_TAB: 'Digest' };

  it('summarizes and appends', async () => {
    const openai = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({ choices: [{ message: { content: 'Summary: x\nFacts:\n- a' } }] })
        }
      }
    };

    const appendMock = vi.fn().mockResolvedValue({});
    const sheets = {
      spreadsheets: {
        values: {
          append: appendMock,
          get: vi.fn()
        }
      }
    };

    const app = createApp({ env, openai, sheets });
    const res = await request(app).post('/summarize').send({
      title: 'T',
      inputType: 'text',
      rawInput: 'Hello'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toContain('Summary:');
    expect(appendMock).toHaveBeenCalledOnce();
  });

  it('returns history', async () => {
    const openai = { chat: { completions: { create: vi.fn() } } };
    const sheets = {
      spreadsheets: {
        values: {
          append: vi.fn(),
          get: vi.fn().mockResolvedValue({
            data: { values: [['2024', 'Title', 'text', 'Summary: y', '']] }
          })
        }
      }
    };

    const app = createApp({ env, openai, sheets });
    const res = await request(app).get('/history');

    expect(res.statusCode).toBe(200);
    expect(res.body.rows).toHaveLength(1);
    expect(res.body.rows[0].title).toBe('Title');
  });
});
