import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Contact from '../models/contact.model.js';
import Project from '../models/project.model.js';
import Qualification from '../models/qualification.model.js';
import User from '../models/user.model.js';
import { crud } from '../controllers/crud.controller.js';
import { signin, signout } from '../controllers/auth.controller.js';
import { requireAuth, requireOwner, requireManager, userView } from '../middleware/auth.js';
const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { error: 'Too many attempts. Try again later.' } });
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { error: 'Too many submissions. Try again later.' } });
router.post('/auth/signin', authLimiter, signin);
router.post('/auth/signout', requireAuth, signout);
router.get('/auth/signout', requireAuth, signout);
router.get('/auth/me', requireAuth, (req, res) => res.json(userView(req.auth)));
for (const [name, Model, fields] of [
  ['contacts', Contact, ['firstname', 'lastname', 'email', 'phone', 'message']],
  ['projects', Project, ['title', 'firstname', 'lastname', 'email', 'completion', 'description']],
  ['qualifications', Qualification, ['title', 'firstname', 'lastname', 'email', 'completion', 'description']],
]) {
  const controller = crud(Model, fields);
  const route = Router();
  route.get('/', ...(name === 'contacts' ? [requireAuth, requireManager] : []), controller.list);
  route.get('/:id', ...(name === 'contacts' ? [requireAuth, requireManager] : []), controller.read);
  route.post('/', ...(name === 'contacts' ? [contactLimiter] : [requireAuth, requireManager]), controller.create);
  route.put('/:id', requireAuth, requireManager, controller.update);
  route.delete('/:id', requireAuth, requireManager, controller.remove);
  route.delete('/', requireAuth, requireManager, controller.removeAll);
  router.use('/' + name, route);
}
const users = crud(User, ['name', 'email', 'password']);
router.post('/users', authLimiter, users.create);
router.get('/users', requireAuth, requireManager, users.list);
router.get('/users/:id', requireAuth, (req, res, next) => {
  if (req.auth.id === req.params.id) return next();
  return requireManager(req, res, next);
}, users.read);
router.put('/users/:id', requireAuth, requireManager, users.update);
router.delete('/users/:id', requireAuth, requireManager, users.remove);
// Whole-collection user deletion is available only in explicitly enabled local lab mode.
router.delete('/users', requireAuth, requireManager, (req, res, next) => {
  if (process.env.ALLOW_LAB_BULK_USER_DELETE !== 'true' || process.env.NODE_ENV === 'production')
    return res.status(403).json({ error: 'Bulk user deletion is disabled outside local lab mode' });
  next();
}, users.removeAll);
export default router;
