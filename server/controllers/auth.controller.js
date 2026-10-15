import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { userView } from '../middleware/auth.js';
export async function signin(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email and password are required' });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password +tokenVersion');
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Incorrect email or password' });
  const token = jwt.sign({ version: user.tokenVersion }, process.env.JWT_SECRET,
    { subject: user.id, expiresIn: '1h', algorithm: 'HS256' });
  res.json({ token, user: userView(user) });
}
export async function signout(req, res) {
  // Persist revocation so the old JWT is rejected even after a server restart.
  await User.updateOne({ _id: req.auth._id }, { $inc: { tokenVersion: 1 } });
  res.json({ message: 'Signed out. All existing sessions for this account have been revoked.' });
}
