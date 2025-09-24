## Database

The application uses different database providers for development and production environments.

### Development

- **Provider**: SQLite
- **Database file**: `pizza-truck.db` (in the project root)
- **ORM**: Drizzle ORM with schema defined in `shared/schema.ts`.
- **Schema Management**: On application startup, tables are created directly if they don't exist, as defined in `server/db.ts`. This is for rapid development and does not use migration files.

### Production (and similar environments)

- **Provider**: PostgreSQL (as configured in `drizzle.config.ts`)
- **Schema Management**: Migrations are handled by Drizzle Kit. The `npm run db:push` command can be used to push schema changes, which is suitable for prototyping and some PaaS providers. For more robust deployments, generating migration files with `drizzle-kit generate` would be recommended.

### Entities

- Users, Suppliers, Ingredients
- Purchases, Purchase Items
- Inventory Lots (FIFO), Stock Movements
- Products, Recipe Items
- Sales, Sale Items, Cash Sessions
- Expenses

### FIFO Inventory

- Lots are consumed oldest-first for sales and negative adjustments.


