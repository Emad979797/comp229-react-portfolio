import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdir } from 'node:fs/promises';
const dbPath = new URL('../.data/mongodb/', import.meta.url).pathname;
await mkdir(dbPath, { recursive: true });
const db = await MongoMemoryServer.create({ instance: { port: 27017, dbName: 'Portfolio', dbPath, storageEngine: 'wiredTiger' } });
console.log('Local MongoDB running at mongodb://127.0.0.1:27017/Portfolio');
console.log('Data is stored in .data/mongodb. Keep this terminal open.');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await db.stop(); process.exit(0); });
