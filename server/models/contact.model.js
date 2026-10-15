import mongoose from 'mongoose';
import { personFields } from './fields.js';
export default mongoose.model('Contact', new mongoose.Schema({
  ...personFields,
  phone: { type: String, trim: true, maxlength: 50 },
  message: { type: String, trim: true, maxlength: 5000 },
}, { timestamps: true }), 'contacts');
