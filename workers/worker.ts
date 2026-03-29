import { run } from 'graphile-worker';

import { crontab } from './crontab';
import { taskList } from './tasks';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the worker');
}

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? '5');

run({
  connectionString,
  taskList,
  crontab,
  concurrency: Number.isFinite(concurrency) ? concurrency : 5,
  pgSettings: {
    timezone: 'UTC',
  },
}).catch((error) => {
  console.error('[worker] Fatal error:', error);
  process.exit(1);
});
