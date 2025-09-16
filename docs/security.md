## Security

Auth
- Session-based auth with Passport Local.
- Passwords hashed using scrypt.

Authorization
- Role checks via `requireRole` middleware.

Validation
- Zod validation for all write endpoints.

Data sanitization
- Password removed from user responses via `sanitizeUser`.

Transport
- Use HTTPS in production. Set `SESSION_SECRET`.


