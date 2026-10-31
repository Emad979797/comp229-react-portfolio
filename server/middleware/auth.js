import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
export async function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'Sign in required' });
  try {
    const claims = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(claims.sub).select('+tokenVersion');
    if (!user || user.tokenVersion !== claims.version) return res.status(401).json({ error: 'Session expired' });
    req.auth = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'CastError')
      return res.status(401).json({ error: 'Invalid or expired token' });
    next(error);
  }
}
export function requireOwner(req, res, next) {
  if (req.auth.id !== req.params.id) return res.status(403).json({ error: 'You can only modify your own account' });
  next();
}

export function requireManager(req, res, next) {
  if (req.auth.role !== 'admin')
    return res.status(403).json({ error: 'Administrator access required' });
  next();
}
export function userView(user) {
  return { ...user.toJSON(), canManage: user.role === 'admin' };
}
