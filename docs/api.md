## API Reference

Base URL: `/api`

Auth
- POST `/api/register`
- POST `/api/login`
- GET `/api/user`
- POST `/api/logout`

Inventory
- GET `/ingredients`
- POST `/ingredients`
- GET `/stock/current`
- GET `/stock/low`
- POST `/stock/adjust`
- GET `/stock/movements?ingredientId`

Suppliers
- GET `/suppliers`
- POST `/suppliers`

Products & Recipes
- GET `/products`
- POST `/products`
- GET `/products/:id/recipe`

Purchases
- GET `/purchases`
- POST `/purchases`

Sales & Sessions
- GET `/sales?from&to`
- POST `/sales`
- GET `/sales/:id/items`
- GET `/sessions`
- GET `/sessions/active`
- POST `/sessions/open`
- POST `/sessions/:id/close`

Expenses
- GET `/expenses`
- POST `/expenses`

Reports
- GET `/reports/overview`
- GET `/reports/top-products?from&to`
- GET `/reports/activity?limit`

See `server/routes.ts` and `client/src/lib/api.ts` for signatures and usage.


