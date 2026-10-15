import mongoose from 'mongoose';
import { portfolioFields } from './fields.js';
export default mongoose.model('Project', new mongoose.Schema(portfolioFields, { timestamps: true }), 'projects');
