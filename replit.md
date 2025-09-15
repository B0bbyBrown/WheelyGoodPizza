# Pizza Truck Operations Management System

## Overview

This is a comprehensive food truck operations management system built for a pizza truck business. The application provides a complete solution for managing inventory, purchases, sales, cash sessions, expenses, and business analytics. It features a modern web interface with real-time data tracking, FIFO inventory management, and detailed reporting capabilities.

The system is designed to handle the day-to-day operations of a food truck, including ingredient tracking, recipe management (Bill of Materials), point-of-sale functionality, and financial reporting with KPI dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Validation**: Zod schemas for request/response validation
- **Authentication**: Simple header-based authentication (demo implementation)
- **File Structure**: Organized into routes, storage layer, and business logic

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Database Connection**: Connection pooling with pg (node-postgres)
- **FIFO Implementation**: Custom FIFO (First In, First Out) inventory lot tracking system

### Authentication and Authorization
- **Current Implementation**: Simple demo authentication with user ID headers
- **Role-based Access**: Three user roles (ADMIN, CASHIER, KITCHEN) with different permissions
- **Session Management**: Planned for production implementation
- **Security**: Middleware-based route protection

### Key Business Logic Components

#### Inventory Management
- **FIFO System**: Automatic first-in-first-out inventory consumption
- **Lot Tracking**: Individual inventory lots with purchase dates and costs
- **Stock Monitoring**: Low stock alerts and real-time quantity tracking
- **Stock Adjustments**: Manual inventory adjustments with audit trails

#### Recipe Management (BOM)
- **Product Recipes**: Ingredient requirements for each menu item
- **Cost Calculation**: Automatic cost calculation based on ingredient prices
- **Stock Validation**: Ensures sufficient ingredients before allowing sales

#### Sales Processing
- **Point of Sale**: Real-time sales interface with product selection
- **Payment Types**: Support for cash, card, and other payment methods
- **Stock Depletion**: Automatic inventory reduction using FIFO methodology
- **Receipt Generation**: Transaction records with line items

#### Financial Management
- **Cash Sessions**: Opening/closing cash drawer management
- **Expense Tracking**: Business expense categorization and tracking
- **Financial Reporting**: Revenue, profit, and expense analytics

### Shared Components
- **Schema Definitions**: Centralized Zod schemas in `/shared/schema.ts`
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Path Aliases**: Organized import structure with @/ and @shared/ aliases

### Development Architecture
- **Monorepo Structure**: Client and server code in unified repository
- **Development Server**: Concurrent development with Vite HMR and Express
- **Build Process**: Separate build processes for client (Vite) and server (esbuild)
- **Code Quality**: ESLint and Prettier configuration for consistent code style

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database for all application data
- **Drizzle ORM**: Type-safe database access layer
- **Connection Pooling**: pg library for efficient database connections

### Frontend Libraries
- **React Ecosystem**: React 18 with TypeScript and modern hooks
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with PostCSS processing
- **State Management**: TanStack Query for server state
- **Form Libraries**: React Hook Form with Hookform Resolvers
- **Date Handling**: date-fns for date manipulation and formatting

### Backend Dependencies
- **Express.js**: Web application framework
- **Validation**: Zod for schema validation and type inference
- **Development Tools**: tsx for TypeScript execution, nodemon for development

### Build and Development Tools
- **Vite**: Frontend build tool and development server
- **esbuild**: Fast TypeScript/JavaScript bundler for server code
- **TypeScript**: Static type checking across the entire application
- **Concurrently**: Running multiple development processes

### Utility Libraries
- **Class Variance Authority**: Component variant management
- **clsx**: Conditional className utility
- **Tailwind Merge**: Tailwind class conflict resolution
- **Nanoid**: Unique ID generation

### Development Environment
- **Replit Integration**: Vite plugins for Replit development environment
- **Error Handling**: Runtime error overlay for development
- **Hot Module Replacement**: Fast development feedback loop