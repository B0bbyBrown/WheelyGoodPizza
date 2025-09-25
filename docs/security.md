## Security

### Authentication
- **Strategy**: Session-based authentication using Passport.js with the `passport-local` strategy for email and password verification.
- **Password Hashing**: Passwords are securely hashed using Node.js's built-in `crypto.scrypt` function, which is a strong, memory-hard algorithm.
- **Password Migration**: The system includes a migration path for legacy plaintext passwords. If a user logs in with a plaintext password, it is verified, and upon successful authentication, the password is re-hashed with scrypt and updated in the database.

### Authorization
- **Role-Based Access Control (RBAC)**: API routes are protected using a `requireRole` middleware. This ensures that only users with the appropriate role (e.g., `ADMIN`) can access certain endpoints.
- **Admin Privilege**: Users with the `ADMIN` role have universal access and bypass specific role checks in the `requireRole` middleware.

### Input Validation
- **Schema Validation**: All API endpoints that accept data (`POST`, `PUT`, etc.) validate the request body against a Zod schema. This prevents malformed data from being processed and acts as a first line of defense against injection attacks.

### Data Sanitization
- **User Data**: The `sanitizeUser` function is used to remove the password hash from user objects before sending them in API responses, preventing sensitive data exposure.

### Session Management
- **Session Secret**: A strong, unique `SESSION_SECRET` environment variable is critical for production to prevent session hijacking. The development server uses a hardcoded, insecure secret.

### Transport Security
- **HTTPS**: In production, the application must be served over HTTPS to protect data in transit from eavesdropping and man-in-the-middle attacks.

### Dependencies
- **Regular Audits**: It is recommended to regularly audit dependencies for known vulnerabilities using tools like `npm audit` and keep them up-to-date.


