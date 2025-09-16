## Roadmap & Migration Plan

Short-term
- Error boundaries and improved API error messages
- Tests for storage layer (FIFO, sales, sessions)

Styling Migration
- Replace Tailwind with CSS Modules (scoped styles per component)
- Keep shadcn/ui semantics; port tokens to CSS variables

Astro Migration
- Convert routes to Astro pages with React islands for interactive parts
- Keep API server in Express; deploy as separate adapter or integrated node app
- Benefits: content-driven pages, faster static delivery

Performance
- Add indexes to common queries
- Enable HTTP caching for static assets


