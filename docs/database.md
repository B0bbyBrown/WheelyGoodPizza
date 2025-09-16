## Database

SQLite database with Drizzle ORM schema in `shared/schema.ts`.

Entities
- Users, Suppliers, Ingredients
- Purchases, Purchase Items
- Inventory Lots (FIFO), Stock Movements
- Products, Recipe Items
- Sales, Sale Items, Cash Sessions
- Expenses

Migrations
- Generated/pushed via Drizzle CLI (`package.json` scripts).

FIFO Inventory
- Lots are consumed oldest-first for sales and negative adjustments.


