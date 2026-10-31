// Disposable local demonstration database. Never connects to the hosted database.
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.NODE_ENV = 'test';
const db = await MongoMemoryServer.create();
await mongoose.connect(db.getUri(), { dbName: 'PortfolioAssignment3Preview' });
const { default: User } = await import('../server/models/user.model.js');
const { default: Project } = await import('../server/models/project.model.js');
const { default: Qualification } = await import('../server/models/qualification.model.js');
await User.create({ name: 'Demo Administrator', email: 'admin@example.com', password: 'Demo-Admin-2026', role: 'admin' });
await User.create({ name: 'Demo Viewer', email: 'viewer@example.com', password: 'Demo-Viewer-2026', role: 'user' });
const data = { firstname: 'Demo', lastname: 'Student', email: 'demo@example.com', completion: '2026-10-31', description: 'Fictional record for the Assignment 3 demonstration.' };
await Project.create({ ...data, title: 'Full Stack Portfolio Demo' });
await Qualification.create({ ...data, title: 'React and API Integration Demo' });
const { default: app } = await import('../server/express.js');
const server = app.listen(3003, '127.0.0.1', () => console.log('Local preview: http://127.0.0.1:3003'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => {
  server.close(); await mongoose.disconnect(); await db.stop(); process.exit(0);
});
