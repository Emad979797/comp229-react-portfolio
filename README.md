# COMP229 Assignment 3 Full Stack Portfolio

Emad Al Nounou — React, Express, MongoDB and JWT authentication.

## Run locally

Use Node.js 22.12+ or 24 LTS. Run `npm ci` and `npm ci --prefix client`.
Copy `.env.example` to `.env` and set your MongoDB URI, a random JWT secret of at least 32 characters, and `PORTFOLIO_OWNER_EMAIL`.
Run `npm run local-db` if you need a persistent local MongoDB instance, then `npm run dev` in another terminal.
Open http://localhost:5173. Alternatively, run `npm run build` and `npm start` for the combined app on port 3000.

## Administrator setup

Set `SEED_OWNER_PASSWORD` locally and run `npm run seed` against the intended database. This creates the configured owner as an administrator, or promotes an existing owner account without changing its password. The role is stored in MongoDB as `admin`; passwords are bcrypt hashes. Existing records are preserved. Do not commit credentials or `.env`.

All public registrations receive `role: user`. Registration and update requests cannot set a role. Administrators are provisioned through the seed script, never through a public form. On startup, the configured Assignment 2 owner is migrated to the stored Admin role only if that legacy document has no role field. New public accounts always have a stored User role and cannot qualify for this migration. Use the seed script for explicit administrator provisioning.

## Roles and forms

The Workspace has Sign Up and Sign In forms. Administrators can create, read, update and delete projects, education, contacts and user accounts. The frontend hides editing controls for normal users and the backend independently enforces administrator permissions. Normal users can read projects and education. Visitors can submit the public Contact form; contact messages and account lists are visible only to administrators. This preserves visitor privacy.

React state controls all form values, authenticated user, selected resource, editing record, loading, errors and success messages. Successful writes reload the current resource from MongoDB. Public Projects and Education pages also display database records alongside the original portfolio content. Sessions use a one-hour JWT held in memory; refreshing requires signing in again. Sign out revokes the account's existing tokens in MongoDB.

## API

`POST /api/auth/signin` returns a token and role. `GET /api/auth/signout` revokes sessions (POST is also supported). `GET /api/auth/me` returns the signed-in user. Send `Authorization: Bearer <token>` for protected requests.

Each resource (`contacts`, `projects`, `qualifications`, `users`) has GET list, GET by ID, POST, PUT by ID, DELETE by ID and DELETE list routes. List deletion is not exposed in the UI. User bulk deletion additionally requires `ALLOW_LAB_BULK_USER_DELETE=true` and is always disabled in production. Project and qualification reads and public contact submissions do not require a token. User registration is public; all account updates/deletion require an administrator.

## Verify and demonstrate

`npm test` runs real MongoDB integration tests in a disposable database. It checks CRUD, password hashing, default User role, role injection rejection, administrator permissions, blocked User writes, validation and revoked JWTs. `npm run build --prefix client` checks the frontend build.

For a disposable local demo, build the frontend and run `node scripts/preview-lab.js`. Open http://127.0.0.1:3003/#/workspace. Demo-only accounts are `admin@example.com` / `Demo-Admin-2026` and `viewer@example.com` / `Demo-Viewer-2026`. This script creates an isolated temporary database and never reads hosted credentials. These accounts do not exist on the deployed site.

## Existing hosting

The current deployment is https://emad-portfolio.onrender.com and the repository is https://github.com/Emad979797/comp229-react-portfolio. Deploy the Assignment 3 branch through the existing Render service; preserve its Atlas URI, JWT secret and instance plan. Run administrator provisioning against the hosted database, then verify the live roles, forms and health route. A frontend-only host cannot run this Express/MongoDB backend.

## Submission

Include the final hosted URL, the Assignment 3 GitHub branch or source ZIP, a new video showing local and hosted operation, and the Word screenshot report. Use fictional contact data in demonstrations.
