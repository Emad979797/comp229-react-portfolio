export const personFields = {
  firstname: { type: String, required: true, trim: true, maxlength: 100 },
  lastname: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'] },
};
export const portfolioFields = {
  ...personFields,
  title: { type: String, required: true, trim: true, maxlength: 200 },
  completion: { type: Date, required: true },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
};
