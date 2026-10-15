import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
process.env.ALLOW_LAB_BULK_USER_DELETE = 'true';
process.env.PORTFOLIO_OWNER_EMAIL = 'tester@example.com';
const { default: app } = await import('../server/express.js');
const { default: User } = await import('../server/models/user.model.js');
let db, token, uid;
const account = { name: 'Lab Tester', email: 'tester@example.com', password: 'Test-portfolio-2026' };
const auth = () => ({ Authorization: `Bearer ${token}` });
before(async () => {
  db = await MongoMemoryServer.create();
  await mongoose.connect(db.getUri(), { dbName: 'Portfolio' });
  await User.init();
});
after(async () => { await mongoose.disconnect(); await db?.stop(); });
test('registration, password hashing, duplicate email and invalid login', async () => {
  const created = await request(app).post('/api/users').send(account).expect(201);
  uid = created.body._id;
  assert.equal(created.body.password, undefined);
  const stored = await User.findById(uid).select('+password');
  assert.notEqual(stored.password, account.password);
  await request(app).post('/api/users').send(account).expect(409);
  await request(app).post('/api/auth/signin').send({ ...account, password: 'incorrect' }).expect(401);
  const login = await request(app).post('/api/auth/signin').send(account).expect(200);
  token = login.body.token;
  assert.equal(login.body.user.password, undefined);
  await request(app).get('/api/auth/me').set(auth()).expect(200);
});
for (const resource of ['contacts', 'projects', 'qualifications']) {
  test(`${resource}: all six CRUD endpoints, validation and protected routes`, async () => {
    const body = { firstname: 'Sample', lastname: 'Student', email: 'sample@example.com',
      ...(resource === 'contacts' ? { phone: '555-0100', message: 'Lab demonstration' } : { title: 'Sample item', completion: '2026-10-15', description: 'Lab demonstration' }) };
    await request(app).put(`/api/${resource}/507f1f77bcf86cd799439011`).send(body).expect(401);
    await request(app).post(`/api/${resource}`).set(auth()).send({ email: 'bad' }).expect(400);
    const created = await request(app).post(`/api/${resource}`).set(auth()).send(body).expect(201);
    const id = created.body._id;
    const list = await request(app).get(`/api/${resource}`).set(auth()).expect(200);
    assert.ok(list.body.some(item => item._id === id));
    if (resource === 'contacts') await request(app).get(`/api/${resource}`).expect(401);
    const one = await request(app).get(`/api/${resource}/${id}`).set(auth()).expect(200);
    assert.equal(one.body.firstname, 'Sample');
    const updated = await request(app).put(`/api/${resource}/${id}`).set(auth()).send({ firstname: 'Updated' }).expect(200);
    assert.equal(updated.body.firstname, 'Updated');
    await request(app).put(`/api/${resource}/${id}`).set(auth()).send({ email: 'invalid' }).expect(400);
    await request(app).get(`/api/${resource}/invalid-id`).set(auth()).expect(400);
    await request(app).delete(`/api/${resource}/${id}`).set(auth()).expect(200);
    await request(app).get(`/api/${resource}/${id}`).set(auth()).expect(404);
    await request(app).post(`/api/${resource}`).set(auth()).send(body).expect(201);
    const cleared = await request(app).delete(`/api/${resource}`).set(auth()).expect(200);
    assert.equal(cleared.body.deletedCount, 1);
  });
}
test('users: owner-only updates/deletion, hashing on update and bulk-delete policy', async () => {
  const other = await request(app).post('/api/users').send({ ...account, email: 'other@example.com' }).expect(201);
  await request(app).put(`/api/users/${other.body._id}`).set(auth()).send({ name: 'Unauthorized' }).expect(403);
  await request(app).delete(`/api/users/${other.body._id}`).set(auth()).expect(403);
  const otherLogin = await request(app).post('/api/auth/signin').send({ email: 'other@example.com', password: account.password }).expect(200);
  await request(app).get('/api/contacts').set('Authorization', `Bearer ${otherLogin.body.token}`).expect(403);
  await request(app).post('/api/projects').set('Authorization', `Bearer ${otherLogin.body.token}`).send({}).expect(403);
  await request(app).get('/api/users').set(auth()).expect(200);
  await request(app).get(`/api/users/${uid}`).set(auth()).expect(200);
  await request(app).put(`/api/users/${uid}`).set(auth()).send({ name: 'Updated Tester', password: 'New-password-2026' }).expect(200);
  await request(app).post('/api/auth/signin').send({ email: account.email, password: 'New-password-2026' }).expect(200);
  process.env.NODE_ENV = 'production';
  await request(app).delete('/api/users').set(auth()).expect(403);
  process.env.NODE_ENV = 'test';
});
test('signout revokes the token and malformed requests return useful errors', async () => {
  await request(app).post('/api/auth/signout').set(auth()).expect(200);
  await request(app).get('/api/auth/me').set(auth()).expect(401);
  await request(app).get('/api/auth/me').set('Authorization', 'Bearer forged').expect(401);
  await request(app).post('/api/contacts').set('Content-Type', 'application/json').send('{').expect(400);
  await request(app).get('/api/missing').expect(404);
  await request(app).get('/api/health').expect(200);
});
test('users: delete own account and explicit local lab bulk deletion', async () => {
  const session = await request(app).post('/api/auth/signin').send({ email: account.email, password: 'New-password-2026' }).expect(200);
  token = session.body.token;
  const disposable = await request(app).post('/api/users').send({ ...account, email: 'delete-me@example.com' }).expect(201);
  const disposableSession = await request(app).post('/api/auth/signin').send({ email: 'delete-me@example.com', password: account.password }).expect(200);
  await request(app).delete(`/api/users/${disposable.body._id}`).set('Authorization', `Bearer ${disposableSession.body.token}`).expect(200);
  await request(app).get('/api/auth/me').set('Authorization', `Bearer ${disposableSession.body.token}`).expect(401);
  const cleared = await request(app).delete('/api/users').set(auth()).expect(200);
  assert.equal(cleared.body.deletedCount, 2);
});
