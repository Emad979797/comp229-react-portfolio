import mongoose from 'mongoose';
import { portfolioFields } from './fields.js';
export default mongoose.model('Qualification', new mongoose.Schema(portfolioFields, { timestamps: true }), 'qualifications');
