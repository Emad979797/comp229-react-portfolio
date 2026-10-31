import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../server/models/user.model.js';
import Contact from '../server/models/contact.model.js';
import Project from '../server/models/project.model.js';
import Qualification from '../server/models/qualification.model.js';
if (!process.env.MONGODB_URI || !process.env.PORTFOLIO_OWNER_EMAIL || !process.env.SEED_OWNER_PASSWORD)
  throw new Error('Set MONGODB_URI, PORTFOLIO_OWNER_EMAIL and SEED_OWNER_PASSWORD before seeding.');
try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'Portfolio' });
  const email = process.env.PORTFOLIO_OWNER_EMAIL.toLowerCase();
  const admin = await User.findOne({ email });
  if (!admin) await User.create({ name: 'Portfolio Admin', email, password: process.env.SEED_OWNER_PASSWORD, role: 'admin' });
  else { admin.role = 'admin'; await admin.save(); }
  const person = { firstname: 'Sample', lastname: 'Student', email: 'sample@example.com' };
  if (!(await Contact.exists({ email: person.email }))) await Contact.create({ ...person, message: 'Fictional contact for the Assignment 3 demonstration.', phone: '555-0100' });
  for (const [Model, title, description] of [
    [Project, 'Portfolio Backend Lab', 'Sample project record used to demonstrate the portfolio REST API.'],
    [Qualification, 'Web Application Development Lab', 'Sample qualification record used to demonstrate the portfolio REST API.'],
  ]) if (!(await Model.exists({ title }))) await Model.create({ ...person, title, description, completion: new Date('2026-10-15') });
  console.log('Owner account and clearly labelled sample records are ready. Existing records were preserved.');
} finally { await mongoose.disconnect(); }
