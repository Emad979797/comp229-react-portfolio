import User from './models/user.model.js';
// Preserve the configured Assignment 2 owner's existing access when upgrading.
// Only legacy documents without a stored role qualify; public signups always store user.
export async function migrateLegacyOwner() {
  const email = (process.env.PORTFOLIO_OWNER_EMAIL || '').trim().toLowerCase();
  if (email) await User.updateOne({ email, role: { $exists: false } }, { $set: { role: 'admin' } });
}
