# Deployment Guide

This guide covers deploying the application to a production-like environment. The project is configured for Vercel, but the principles can be adapted to other platforms.

## Vercel Deployment

The project is pre-configured for deployment on Vercel.

### Configuration (`vercel.json`)
- **`buildCommand`**: `npm run vercel-build`, which runs the standard `npm run build` command.
- **`installCommand`**: `npm ci` for clean, consistent dependency installation.
- **`outputDirectory`**: `dist/public`, where the built frontend assets are located.
- **`rewrites`**: All requests that are not for the `/api` route are rewritten to `index.html`. This is standard for a Single Page Application (SPA) to enable client-side routing.

### Deployment Steps
1. Connect your Git repository to a Vercel project.
2. Vercel will automatically detect the configuration and build/deploy the application on each push.
3. **Environment Variables**: You must set the `SESSION_SECRET` environment variable in the Vercel project settings for production.

## General Deployment (e.g., on a VPS)

### 1. Prerequisites
- Node.js (version 20.x or higher, as specified in `package.json`)
- A process manager like PM2 is highly recommended.

### 2. Environment Setup
Create a `.env` file in the project root with the following variables:
```
NODE_ENV=production
SESSION_SECRET=your-strong-random-secret-key
PORT=5000 # Or any port you prefer
```
Generate a strong session secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Build and Start
```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start the server using the production script
npm start
```
For a more robust setup, use PM2:
```bash
npm install -g pm2
pm2 start dist/index.js --name pizza-truck
```

### 4. Database
The application is configured to use a SQLite database (`pizza-truck.db`) by default. This file will be created in the project root on the first run.
- **Backup**: Regularly back up the `pizza-truck.db` file.
- **PostgreSQL**: To use PostgreSQL in production, set the `DATABASE_URL` environment variable and ensure your `drizzle.config.ts` is correctly configured for your provider. You will also need to run migrations.

### 5. Reverse Proxy (Recommended)
It is recommended to run the application behind a reverse proxy like Nginx to handle SSL termination (HTTPS), caching, and load balancing.