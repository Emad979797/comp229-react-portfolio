# Assignment 2 Video Walkthrough

Record the real running application. A five to seven minute walkthrough can follow this order.

1. Introduce yourself and identify COMP229 Assignment 2. Show the local URL and the Home, About, Projects, Education, Services and Contact pages retained from Assignment 1.
2. Submit fictional contact details. Show the confirmation and sign in to Workspace as the portfolio owner. Show that the new contact is stored and remains after refreshing and signing in again.
3. Show the root `server.js`, the models, controllers and routes. Explain that Mongoose connects to the `Portfolio` database. Show the terminal connection message without exposing `.env` or the database URI.
4. Show MongoDB's `Portfolio` database with the contacts, projects, qualifications and users collections. Show sample documents and the user timestamps. Never display passwords, connection credentials or JWTs in the recording.
5. Use Postman to demonstrate GET-all, GET-by-ID, POST, PUT, DELETE-by-ID and DELETE-all against disposable records. Show the returned IDs and status codes. Repeat enough examples to cover all four resources. Demonstrate whole-user deletion only in the disposable local lab database, then disable the lab flag.
6. Demonstrate a protected route returning 401 without a token, sign in, access the protected route, sign out, and show that the old token now returns 401. Demonstrate that a normal registered account receives 403 for owner-only actions.
7. Open the deployed HTTPS site. Show the hosted URL and `/api/health`. Submit another fictional contact and demonstrate that it appears in the hosted Workspace. Show the repository URL.
8. End with a brief explanation of React, Express, Mongoose, MongoDB and JWT and where each is used.

Upload the recording to the video host of your choice with link access. Test the link in a private browser window, then include it with the live URL and GitHub URL in the assignment submission. Do not submit until all three links work.
