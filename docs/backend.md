## Backend

Express app with Passport-based session auth and Drizzle ORM.

Key files:
- `server/index.ts` – server bootstrap, logging, vite/static setup
- `server/routes.ts` – API routes
- `server/storage.ts` – storage interface and in-memory ref
- `server/sqlite-storage.ts` – SQLite implementation with transactions
- `server/auth.ts` – Passport strategies and session wiring
- `shared/schema.ts` – Drizzle schema + Zod

Startup
- `npm run dev` starts Express on port 5081, seeds demo data if needed.

Error handling
- Central error middleware returns `{ message }` and logs errors.

Transactions
- Complex writes (purchases, sales, stock adjustments) run in a Drizzle transaction.

Auth
- Session-based via `express-session` and `passport-local`.


