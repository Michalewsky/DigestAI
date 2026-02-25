import { readEnv } from './env.js';
import { createOpenAIClient } from './summarizer.js';
import { createCsvStore } from './csvStore.js';
import { migrateFromSheetsToCsv } from './migrateFromSheets.js';
import { createApp } from './app.js';

const env = readEnv();
const openai = createOpenAIClient(env);
const storage = await createCsvStore(env);

if (env.MIGRATE_FROM_SHEETS) {
  try {
    const result = await migrateFromSheetsToCsv({ env, storage });
    if (result.skipped) {
      console.warn(`Migration skipped: ${result.reason}`);
    } else {
      console.log(`Migrated ${result.migrated} rows from legacy Google Sheets into ${storage.path}`);
    }
  } catch (error) {
    console.warn(`Migration failed: ${error.message}`);
  }
}

const app = createApp({ env, openai, storage });

app.listen(env.PORT, () => {
  console.log(`DigestAI backend running at http://localhost:${env.PORT}`);
  console.log(`CSV storage path: ${storage.path}`);
});
