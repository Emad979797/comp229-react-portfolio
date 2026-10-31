import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { personFields } from './fields.js';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { ...personFields.email, unique: true },
  password: { type: String, required: true, minlength: 8, maxlength: 72, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  tokenVersion: { type: Number, default: 0, select: false },
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' },
  toJSON: { transform(_doc, value) { delete value.password; delete value.tokenVersion; return value; } } });
schema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
export default mongoose.model('User', schema, 'users');
