# Technical Documentation

## Architecture Overview

### System Design

The Pizza Truck Operations Management System follows a modern full-stack architecture with a React frontend, Express.js backend, and SQLite database. The system is designed for portability, performance, and maintainability.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │ Express Backend │    │ SQLite Database │
│                 │◄──►│                 │◄──►│                 │
│  • UI Components│    │  • REST API     │    │  • Local File   │
│  • State Mgmt   │    │  • Auth & Auth  │    │  • ACID Trans   │
│  • Type Safety  │    │  • Business Logic│   │  • Schema Mgmt  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack Details

#### Frontend (Client)
- **React 18**: Latest React with hooks and concurrent features
- **TypeScript**: Full type safety across the application
- **Vite**: Fast development server with HMR (Hot Module Replacement)
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI + shadcn/ui**: Accessible component primitives
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing library
- **React Hook Form**: Form handling with validation

#### Backend (Server)
- **Node.js 18+**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Static typing for backend code
- **Passport.js**: Authentication middleware
- **Express Session**: Session management
- **Zod**: Runtime type validation

#### Database & ORM
- **SQLite**: Embedded database for portability
- **Drizzle ORM**: Type-safe database toolkit
- **Better-SQLite3**: Synchronous SQLite driver
- **Drizzle Kit**: Database migrations and introspection

## Database Schema

### Entity Relationship Diagram

```
Users ──┐
        │
        ├── Sessions (1:M)
        │
        └── CashSessions (1:M)
              │
              └── Sales (1:M)
                    └── SaleItems (1:M)

Suppliers ──┐
            └── Purchases (1:M)
                  └── PurchaseItems (1:M)
                        └── InventoryLots (1:1)

Ingredients ──┐
              ├── RecipeItems (1:M) ──┐
              ├── InventoryLots (1:M)  │
              └── StockMovements (1:M) │
                                      │
Products ─────────────────────────────┘
        └── SaleItems (1:M)

Expenses (standalone)
```

### Core Tables

#### Users & Authentication
```sql
-- users: System user accounts
id           INTEGER PRIMARY KEY
email        TEXT UNIQUE NOT NULL
password     TEXT NOT NULL  -- Hashed with crypto.scrypt
role         TEXT NOT NULL  -- ADMIN, CASHIER, KITCHEN
name         TEXT NOT NULL
created_at   TEXT NOT NULL
updated_at   TEXT NOT NULL

-- Note: Express sessions are stored in-memory via MemoryStore
-- No database table required for session storage in current implementation
```

#### Inventory Management
```sql
-- ingredients: Raw materials and supplies
id           INTEGER PRIMARY KEY
name         TEXT UNIQUE NOT NULL
unit         TEXT NOT NULL
category     TEXT NOT NULL
minimum_qty  INTEGER DEFAULT 0
created_at   TEXT NOT NULL
updated_at   TEXT NOT NULL

-- suppliers: Vendor information
id           INTEGER PRIMARY KEY
name         TEXT UNIQUE NOT NULL
contact_person TEXT
email        TEXT
phone        TEXT
address      TEXT
created_at   TEXT NOT NULL
updated_at   TEXT NOT NULL

-- inventory_lots: FIFO lot tracking
id           INTEGER PRIMARY KEY
ingredient_id INTEGER REFERENCES ingredients(id)
quantity     INTEGER NOT NULL
cost_per_unit REAL NOT NULL
expiry_date  TEXT
purchase_date TEXT NOT NULL
is_depleted  INTEGER DEFAULT 0
created_at   TEXT NOT NULL
updated_at   TEXT NOT NULL
```

#### Purchase Management
```sql
-- purchases: Purchase orders/receipts
id           INTEGER PRIMARY KEY
supplier_id  INTEGER REFERENCES suppliers(id)
total_amount REAL NOT NULL
purchase_date TEXT NOT NULL
invoice_number TEXT
notes        TEXT
created_at   TEXT NOT NULL
updated_at   TEXT NOT NULL

-- purchase_items: Items in each purchase
id           INTEGER PRIMARY KEY
purchase_id  INTEGER REFERENCES purchases(id)
ingredient_id INTEGER REFERENCES ingredients(id)
quantity     INTEGER NOT NULL
cost_per_unit REAL NOT NULL
expiry_date  TEXT
```

#### Recipe Management
```sql
-- products: Menu items
id           INTEGER PRIMARY KEY
name         TEXT UNIQUE NOT NULL
description  TEXT
price        REAL NOT NULL
category     TEXT NOT NULL
is_available INTEGER DEFAULT 1
created_at   TEXT NOT NULL
updated_at   TEXT NOT NULL

-- recipe_items: Bill of Materials
id           INTEGER PRIMARY KEY
product_id   INTEGER REFERENCES products(id)
ingredient_id INTEGER REFERENCES ingredients(id)
quantity_needed INTEGER NOT NULL
```

#### Sales & Financial
```sql
-- cash_sessions: Cash drawer management
id           INTEGER PRIMARY KEY
user_id      INTEGER REFERENCES users(id)
opening_amount REAL NOT NULL
closing_amount REAL
opened_at    TEXT NOT NULL
closed_at    TEXT
is_active    INTEGER DEFAULT 1

-- sales: Sales transactions
id           INTEGER PRIMARY KEY
cash_session_id INTEGER REFERENCES cash_sessions(id)
total_amount REAL NOT NULL
payment_method TEXT NOT NULL
created_at   TEXT NOT NULL

-- sale_items: Items in each sale
id           INTEGER PRIMARY KEY
sale_id      INTEGER REFERENCES sales(id)
product_id   INTEGER REFERENCES products(id)
quantity     INTEGER NOT NULL
unit_price   REAL NOT NULL

-- expenses: Business expenses
id           INTEGER PRIMARY KEY
amount       REAL NOT NULL
description  TEXT NOT NULL
category     TEXT NOT NULL
date         TEXT NOT NULL
receipt_url  TEXT
created_at   TEXT NOT NULL
updated_at   TEXT NOT NULL

-- stock_movements: Inventory audit trail
id           INTEGER PRIMARY KEY
ingredient_id INTEGER REFERENCES ingredients(id)
movement_type TEXT NOT NULL  -- PURCHASE, SALE, ADJUSTMENT
quantity_change INTEGER NOT NULL
reason       TEXT
reference_id INTEGER
created_at   TEXT NOT NULL
```

## API Endpoints

### Authentication Endpoints

Authentication is handled by Passport.js with the following endpoints:

```typescript
POST /api/login
Body: { email: string, password: string }
Response: { id, email, name, role }

POST /api/register
Body: { email: string, password: string, name: string }
Response: { id, email, name, role: "CASHIER" }

POST /api/logout
Response: { message: "Logged out successfully" }

GET /api/user
Response: { id, email, name, role } | 401
```

### Inventory Management

```typescript
GET /api/ingredients
Response: Ingredient[]

POST /api/ingredients
Body: { name, unit, category, minimum_qty? }
Response: Ingredient

GET /api/inventory-lots
Response: InventoryLot[]

POST /api/purchases
Body: { supplier_id, items: PurchaseItem[] }
Response: Purchase

POST /api/stock/adjust
Body: { ingredientId, quantityChange, reason }
Response: { success: true }
```

### Sales & POS

```typescript
GET /api/products
Response: Product[]

POST /api/sales
Body: { items: SaleItem[], payment_method, cash_session_id }
Response: Sale

GET /api/sessions/active
Response: CashSession | null

POST /api/sessions/open
Body: { openingFloat }
Response: CashSession

POST /api/sessions/:id/close
Body: { closingFloat, notes }
Response: CashSession
```

### Reporting

```typescript
GET /api/reports/sales?start_date&end_date
Response: SalesReport

GET /api/reports/inventory
Response: InventoryReport

GET /api/reports/financial?start_date&end_date
Response: FinancialReport
```

## Business Logic Implementation

### FIFO Inventory System

The system implements First-In-First-Out inventory management:

```typescript
async function consumeIngredients(items: SaleItem[]) {
  for (const item of items) {
    const recipe = await getRecipeItems(item.product_id);
    
    for (const ingredient of recipe) {
      // Get oldest lots first (FIFO)
      const lots = await getInventoryLots(ingredient.ingredient_id)
        .orderBy('purchase_date ASC')
        .where('is_depleted = 0');
      
      let remainingNeeded = ingredient.quantity_needed * item.quantity;
      
      for (const lot of lots) {
        if (remainingNeeded <= 0) break;
        
        const consumed = Math.min(lot.quantity, remainingNeeded);
        await updateLotQuantity(lot.id, lot.quantity - consumed);
        
        if (lot.quantity - consumed === 0) {
          await markLotDepleted(lot.id);
        }
        
        remainingNeeded -= consumed;
      }
      
      if (remainingNeeded > 0) {
        throw new Error(`Insufficient ${ingredient.name} inventory`);
      }
    }
  }
}
```

### Cost Calculation

Product costs are calculated dynamically based on current ingredient prices:

```typescript
async function calculateProductCost(product_id: string) {
  const recipe = await getRecipeItems(product_id);
  let totalCost = 0;
  
  for (const ingredient of recipe) {
    // Use weighted average cost from current inventory lots
    const lots = await getAvailableInventoryLots(ingredient.ingredient_id);
    const avgCost = lots.reduce((sum, lot) => 
      sum + (lot.cost_per_unit * lot.quantity), 0
    ) / lots.reduce((sum, lot) => sum + lot.quantity, 0);
    
    totalCost += avgCost * ingredient.quantity_needed;
  }
  
  return totalCost;
}
```

### Stock Validation

Before allowing sales, the system validates ingredient availability:

```typescript
async function validateStockAvailability(items: SaleItem[]) {
  for (const item of items) {
    const recipe = await getRecipeItems(item.product_id);
    
    for (const ingredient of recipe) {
      const totalNeeded = ingredient.quantity_needed * item.quantity;
      const available = await getTotalAvailableQuantity(ingredient.ingredient_id);
      
      if (available < totalNeeded) {
        throw new Error(`Insufficient ${ingredient.name}: need ${totalNeeded}, have ${available}`);
      }
    }
  }
}
```

## Security Implementation

### Password Security

```typescript
// Password hashing with crypto.scrypt
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hashedBuffer = await scryptAsync(password, salt, 64) as Buffer;
  return salt + '.' + hashedBuffer.toString('hex');
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  const [salt, hashedPassword] = hash.split('.');
  const hashedBuffer = await scryptAsync(password, salt, 64) as Buffer;
  return hashedPassword === hashedBuffer.toString('hex');
}
```

### Authentication Middleware

```typescript
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) return done(null, false);
    
    // Handle legacy plaintext passwords
    const isValid = user.password.includes('.') 
      ? await comparePasswords(password, user.password)
      : user.password === password;
    
    if (!isValid) return done(null, false);
    
    // Migrate plaintext to hashed
    if (!user.password.includes('.')) {
      const hashedPassword = await hashPassword(password);
      await storage.updateUser(user.id, { password: hashedPassword });
    }
    
    return done(null, sanitizeUser(user));
  } catch (error) {
    return done(error);
  }
}));
```

### Route Protection

```typescript
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

## Database Setup Strategy

### Auto-Creation Approach

The system uses direct SQL table creation on startup rather than migrations:

```typescript
// In server/db.ts
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    // ... other columns
  );
  // ... other tables
`);
```

This approach:
- Creates tables automatically on first run
- Uses `IF NOT EXISTS` to prevent errors on subsequent starts
- Ensures schema consistency across deployments
- Eliminates complex migration management

### Session Storage

Express sessions are stored in-memory using MemoryStore:

```typescript
// Both MemStorage and SqliteStorage classes use:
this.sessionStore = new MemoryStore({
  checkPeriod: 86400000, // 24 hours
});
```

**Production Considerations:**
- In-memory sessions are lost on server restart
- Consider persistent session store (Redis) for production
- Current implementation suitable for single-instance deployments

## Development Guidelines

### Code Organization

```
server/
├── auth.ts           # Authentication logic
├── db.ts            # Database connection
├── index.ts         # Server entry point
├── routes.ts        # API route handlers
├── seed.ts          # Database seeding
├── sqlite-storage.ts # SQLite storage implementation
├── storage.ts       # Storage interface
└── lib/
    └── password.ts  # Password utilities

client/src/
├── components/      # Reusable UI components
├── lib/            # Utilities and contexts
├── pages/          # Route components
└── App.tsx         # Main application

shared/
└── schema.ts       # Shared types and Zod schemas
```

### Type Safety

All database operations use Drizzle ORM with TypeScript:

```typescript
// Shared schema with Zod validation
export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Storage interface
interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
}
```

### Error Handling

```typescript
// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});
```

## Performance Considerations

### Database Optimization

1. **Indexing Strategy**
   ```sql
   CREATE INDEX idx_inventory_lots_ingredient ON inventory_lots(ingredient_id);
   CREATE INDEX idx_sales_date ON sales(created_at);
   CREATE INDEX idx_cash_sessions_opened ON cash_sessions(opened_at);
   ```

2. **Query Optimization**
   - Use prepared statements for repeated queries
   - Batch operations where possible
   - Limit result sets with pagination

3. **Connection Management**
   - SQLite uses file-based storage (single connection)
   - WAL mode for better concurrent read performance
   - Regular VACUUM for database maintenance

### Frontend Performance

1. **Code Splitting**
   ```typescript
   const ProductsPage = lazy(() => import('./pages/ProductsPage'));
   const InventoryPage = lazy(() => import('./pages/InventoryPage'));
   ```

2. **Query Optimization**
   ```typescript
   // Cache frequently accessed data
   const { data: ingredients } = useQuery({
     queryKey: ['ingredients'],
     staleTime: 5 * 60 * 1000, // 5 minutes
   });
   ```

3. **Component Optimization**
   ```typescript
   const ProductCard = memo(({ product }: { product: Product }) => {
     return <div>{product.name}</div>;
   });
   ```

## Deployment

### Production Configuration

```bash
# Environment variables
NODE_ENV=production
SESSION_SECRET=your-strong-secret-key
DATABASE_URL=./pizza-truck.db
PORT=5000
```

### Build Process

```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Database Backup Strategy

```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp pizza-truck.db "backups/pizza-truck_$DATE.db"
echo "Database backed up to backups/pizza-truck_$DATE.db"
```

### System Status

The application provides system status through error handling and logging. Database connectivity is verified on startup through table creation.

## Testing Strategy

### Unit Testing
- Jest for backend logic testing
- React Testing Library for component testing
- Zod schema validation testing

### Integration Testing
- Supertest for API endpoint testing
- Database transaction testing
- Authentication flow testing

### End-to-End Testing
- Playwright for full user journey testing
- POS workflow testing
- Inventory management testing

---

*This technical documentation provides a comprehensive guide for developers working on the Pizza Truck Operations Management System.*