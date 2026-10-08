# Project Guide

## Project

This repository contains a school management dashboard built with Next.js 15, React 19, and the App Router. Student, teacher, study-level, and attendance records are served by server-side Next.js API routes backed by PostgreSQL. Authentication uses one administrator account configured in the server environment.

## Commands

- `npm ci` — install the dependencies recorded in `package-lock.json`.
- `npm run dev` — start the development server at `http://localhost:3000`.
- `npm run lint` — run ESLint.
- `npm run build` — create a production build.
- `npm start` — serve a production build.

The development server and production build both use `.next`. Stop the development server before running a production build to avoid conflicting build output.

## Main Files

- `app/layout.js` — root layout, metadata, and global stylesheet import.
- `app/page.js` — reads the existing page markup from `index.html` and renders the home route.
- `app/legacy-dashboard.js` — client component that loads the dashboard scripts.
- `app/api/` — authenticated login, session, logout, and school-data API routes.
- `lib/db.js` — server-only PostgreSQL connection pool.
- `lib/auth.js` — server-side administrator credentials and signed session-cookie handling.
- `database/schema.sql` — schema for student, teacher, study-level, and attendance records.
- `.env.example` — environment variable names and safe placeholders; never put real credentials here.
- `index.html` — dashboard and login markup used by the Next.js home route.
- `styles.css` — global dashboard styles.
- `public/legacy-app.js` — browser-side dashboard behavior, navigation, forms, and same-origin API requests.
- `next.config.mjs` — Next.js configuration.

Most dashboard interactions currently manipulate the DOM directly in `public/legacy-app.js`. Preserve the existing markup IDs and classes when changing that script or `index.html`; the client script uses them to find and update elements. If migrating an interaction to React, update the related markup and behavior together.

## Local PostgreSQL Setup

1. Rotate the database password if it has been shared in chat, then copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL`, `APP_ADMIN_USERNAME`, `APP_ADMIN_PASSWORD`, and a unique `APP_SESSION_SECRET` of at least 32 characters in `.env.local`. URL-encode special characters in the database URL password.
3. Apply `database/schema.sql` to the target database, for example with `psql -h localhost -p 5432 -U postgres -d postgres -f database/schema.sql`.
4. Restart the development server with `npm run dev`, then sign in using the administrator credentials configured in `.env.local`.

Generate a session secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
`.env.local` is ignored by Git. Never put real passwords in source files, client-side code, committed environment examples, or browser storage.

## Data and Security

- Do not add fictional student, teacher, attendance, financial, or activity records. Show a meaningful empty state when real records are not available.
- Student records, teacher records, study levels, and attendance are stored in PostgreSQL and accessed through authenticated server routes.
- Administrator credentials and the signed-session secret are server-side environment variables; sessions use an HttpOnly, SameSite cookie.
- Language preference and Telegram preview settings remain browser-local. Telegram message delivery still requires a protected server integration.
- The configured administrator login is a single-account setup, not a school-wide role/permission system. Do not expose this prototype publicly without production authentication, HTTPS, rate limiting, backups, and appropriate privacy controls.
- Do not put real student personal information, credentials, or Telegram bot tokens in source code, markup, browser storage, or client-side settings.
- QR-code and spreadsheet-import features load libraries from jsDelivr at runtime and need internet access.
- Telegram screens are a frontend preview; message delivery requires a secure backend integration.

## Change Guidelines

- Keep changes focused and preserve the existing dashboard behavior and responsive styling.
- Use the existing JavaScript style in `public/legacy-app.js`; avoid adding example personal data.
- Run `npm run lint` after code changes and `npm run build` when practical. Run them sequentially, not alongside a running development server.
