## Operations

### Development
- **Start Development Server**: Run `npm run dev` to start the Express backend and Vite frontend server. The application will be available on port 5081 by default, but it will automatically find an open port if 5081 is in use.
- **Database Seeding**: On the first run, the application automatically seeds the database with demo data, including an admin user.
- **Logs**: API request logs are written to `dev.log` in the project root.

### Build and Deployment
- **Build**: The `npm run build` command compiles the TypeScript server code and builds the React frontend for production.
- **Start Production Server**: Use `npm start` to run the production server. This command requires the application to be built first.

### Environment Variables
- **`SESSION_SECRET`**: This is a **required** variable for production. It should be a long, random string to secure user sessions.
- **`PORT`**: (Optional) Sets the port for the production server. Defaults to 5000.
- **`DATABASE_URL`**: (Optional) Specifies the connection string for the database. If not provided, the application defaults to using a local SQLite file (`pizza-truck.db`), which is the current behavior for both development and the described production setup.

### Database Management
- **Backup**: To back up the SQLite database, simply copy the `pizza-truck.db` file to a secure location.
- **Schema Changes**: The application uses an auto-creation strategy for the SQLite database, where tables are created if they don't exist on startup. There are no migration files to run. For a production PostgreSQL setup, you would use Drizzle Kit's migration commands.

### Troubleshooting
- **Logs**: Check `dev.log` for detailed API request and response information. The server console also provides logs for startup, database initialization, and errors.
- **Port Conflict**: If the development server fails to start, check if port 5081 (or the configured port) is in use by another application. The server will attempt to find an alternative port automatically in development.


