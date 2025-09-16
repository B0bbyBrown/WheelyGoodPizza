## Frontend

Client app using React + TS, Vite, shadcn/ui, TanStack Query.

Structure
- `client/index.html` – Vite entry
- `client/src/main.tsx` – mounts `App`
- `client/src/App.tsx` – routes and layout
- `client/src/pages/*` – route components
- `client/src/components/ui/*` – shadcn UI components
- `client/src/lib/*` – API client, auth context, query client

State & Data
- TanStack Query manages server state.
- `client/src/lib/api.ts` wraps calls to `/api`.

Styling
- Tailwind with shadcn tokens. CSS Modules planned in `roadmap.md`.

Routing
- Wouter for lightweight routing.


