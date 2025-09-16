## Architecture

High-level overview of the system and key design choices.

- Frontend: React + TS, Vite, TanStack Query, shadcn/ui
- Backend: Express + TS, Passport auth, Drizzle ORM
- Storage: SQLite file DB (`pizza-truck.db`)
- Shared: Zod schemas and types in `shared/schema.ts`

Data flow:
1. Client calls `/api/*` endpoints
2. Server validates with Zod, executes storage methods
3. SQLite reads/writes via Drizzle
4. Responses are serialized to the client

See `end-to-end.md` for a walk-through.


