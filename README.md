# COMP229 Assignment 2 Portfolio

Emad Al Nounou — React portfolio with an Express REST API and MongoDB database.

## Requirements

Node.js 22.12+ or 24 LTS and MongoDB (local or Atlas). The database name is `Portfolio`.

## Local setup

1. Run `npm ci` in the project root and `npm ci --prefix client`.
2. Copy `.env.example` to `.env`. Set a random JWT secret of at least 32 characters and your owner email.
3. Use your local MongoDB URI or an Atlas URI. If MongoDB is not installed, `npm run local-db` starts a real local MongoDB process and preserves its data in `.data/mongodb`. Keep that terminal open. Its first run downloads MongoDB from the official download host.
4. Run `npm run dev` from the root, or run `npm run dev` from `client`. The client runs on http://localhost:5173 and proxies `/api` to http://127.0.0.1:3000.
5. Create the owner account in Workspace using the same email as `PORTFOLIO_OWNER_EMAIL`. Create it before sharing the hosted link.

For a standalone backend, run `node server.js` from the root. To serve the built React app with Express, run `npm run build` then `npm start`, and open http://localhost:3000.

The optional `npm run seed` command creates clearly labelled fictional records and the owner account if it does not exist. It requires `SEED_OWNER_PASSWORD` in your local environment. Existing records are preserved. Do not commit this password or `.env`.

## API

The base URL is `http://localhost:3000/api`. Each resource (`contacts`, `projects`, `qualifications`, `users`) supports:

| Method | Path | Action |
| --- | --- | --- |
| GET | /resource | List records |
| GET | /resource/:id | Read one record |
| POST | /resource | Create a record |
| PUT | /resource/:id | Update a record |
| DELETE | /resource/:id | Delete a record |
| DELETE | /resource | Delete all records |

Contacts require `firstname`, `lastname`, `email`; optional `phone` and `message` retain the Assignment 1 form. Projects and qualifications require `title`, `firstname`, `lastname`, `email`, `completion` (date), and `description`. Users require `name`, `email`, and `password` (8–72 characters); `created` and `updated` are generated dates. Passwords are stored as bcrypt hashes and omitted from responses.

`POST /api/auth/signin` accepts email and password and returns a one-hour JWT. Send it in `Authorization: Bearer <token>`. `POST /api/auth/signout` revokes all existing sessions for that account using a persisted token version. `GET /api/auth/me` returns the current user.

Project and qualification reads, contact creation, and user registration are public. Contact reads and portfolio writes require the configured portfolio owner. Users can read, update and delete their own account; the owner may list users. Whole-collection user deletion requires `ALLOW_LAB_BULK_USER_DELETE=true` and is always disabled when `NODE_ENV=production`. This fulfills the lab endpoint while preventing accidental removal of all hosted accounts. The automated tests exercise this endpoint against a disposable database.

## Verification

Run `npm test`. Tests start a disposable, real MongoDB database and cover all 24 resource endpoints, registration, duplicate email, password hashing, owner permissions, invalid input, missing records, signout revocation, and the production bulk-delete restriction. Test data is separate from your running `Portfolio` database. Run `npm run build --prefix client` to verify the frontend build.

Import `postman/Portfolio.postman_collection.json` in Postman. Set `baseUrl`, `ownerEmail`, and `ownerPassword`; run sign-in to save a token. CRUD requests store IDs automatically. Use only disposable records when demonstrating deletion. Do not share the exported environment if it contains a token or password.

## Deploy on Render with MongoDB Atlas

1. Create an Atlas Free cluster. Create a database user limited to the Portfolio database. Allow your own IP for local use and the outbound IP ranges shown by Render for the deployed service. Avoid allowing every IP when specific ranges are available.
2. Push the project root (including `client`, `server`, `server.js`, both lockfiles, and `render.yaml`) to your Assignment 2 GitHub repository or branch. Exclude `.env`, `node_modules`, `.data`, and built files.
3. Create a Render Node Web Service from that repository. Build command: `npm ci && npm run build`. Start command: `npm start`. Choose the Free instance.
4. Set `NODE_ENV=production`, `MONGODB_URI` (Atlas connection URI), `JWT_SECRET` (a new random secret), and `PORTFOLIO_OWNER_EMAIL` (your email). Render supplies `PORT`. Set `CLIENT_ORIGIN` to the final HTTPS site URL if using cross-origin requests; same-origin requests work without it.
5. Deploy, create the owner account before sharing the link, and verify `/api/health`, Contact, and Workspace on the hosted site. Record the final link for submission.

Render's free service may sleep after inactivity, so open it before recording the walkthrough. GitHub Pages alone cannot run this Express server.

## Submission

Submit the live site URL, GitHub repository URL (or source ZIP), a video link showing local and hosted operation, and the Word document containing database, server and API test screenshots. The cloud deployment and recording must be completed before submission.

Official references: https://expressjs.com/en/guide/error-handling/ ; https://mongoosejs.com/docs/validation.html ; https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/ ; https://render.com/docs/free
