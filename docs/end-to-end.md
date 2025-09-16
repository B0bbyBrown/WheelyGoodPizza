## End-to-End Walkthrough

Goal: Process a sale and see it reflected in reports and inventory.

1. Start the app: `npm run dev` and login (admin/admin123)
2. Create ingredients and record a purchase to add stock
3. Create a product with a recipe (ingredient quantities)
4. Open a cash session
5. Make a sale for the product
6. Verify:
   - Inventory lots consumed (FIFO) and stock movements created
   - Sales recorded with line items and COGS
   - KPIs updated on the dashboard
   - Recent Activity shows sale and stock movement entries
7. Close the cash session and view session reports

Troubleshooting: see `operations.md`.


