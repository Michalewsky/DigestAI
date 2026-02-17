import { readEnv } from './env.js';
import { createSheetsClient } from './sheets.js';
import { createOpenAIClient } from './summarizer.js';
import { createApp } from './app.js';

const env = readEnv();
const openai = createOpenAIClient(env);
const sheets = createSheetsClient(env);

const app = createApp({ env, openai, sheets });

app.listen(env.PORT, () => {
  console.log(`DigestAI backend running at http://localhost:${env.PORT}`);
});
