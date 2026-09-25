# Emad Al Nounou — React Portfolio

COMP229 · Lab Assignment 1 · Fall 2026

## Local development

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open the address printed in your terminal. For a production check:

```sh
npm run build
npm run preview
```

## Pages and implementation

Home, About, Projects, Education, Services, and Contact are separate React routes.
The shared header and footer contain a custom EAN monogram and navigation.
HashRouter lets all six routes work when opened directly or refreshed on GitHub
Pages, without a server-side rewrite rule. Vite's base path keeps images and the
resume download working under a GitHub repository URL.

The contact form validates required fields with native HTML inputs, reads all
five values with FormData, and transfers them to Home using React Router state.
Home displays a confirmation and expandable captured values. It is a classroom
demonstration: it does not send email or submit data to a server.

## Source layout

- `src/main.jsx`: page components, shared layout, and routes.
- `src/contact.js`: contact field capture.
- `src/styles.css`: shared styles and responsive layouts.
- `public/projects/`: screenshots of the three public project sites.
- `vite.config.js`: deployment base path.
- `.github/workflows/deploy.yml`: build and GitHub Pages deployment.

## Project sources

- EduGate: https://github.com/Emad979797/edugate-website
- JSEK (team project): https://github.com/Emad979797/electronics-Market-place
- Taj: https://github.com/Emad979797/Tajwebsitetest

Project screenshots were captured from the public GitHub Pages sites. Project
brand names and images identify the work being showcased. The portfolio's own
logo is the EAN monogram.

## Deployment

Enable GitHub Pages with GitHub Actions as the source. A push to `main` builds
and publishes the site; manual deployment is also supported. The workflow
uses the repository name as the base path.

## Remaining content before submission

- Confirm the institution and completion date for General Arts and Science.
- Provide a professional profile photograph and `public/resume.pdf`.
- Record a walkthrough demonstrating both local and deployed versions.

Submit the source ZIP, repository URL, deployed URL, and video URL. Exclude
`node_modules`, package caches, `.git`, and build output from the source ZIP.
