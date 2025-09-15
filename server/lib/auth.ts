import { type User } from "@shared/schema";

// Simple authentication middleware
export interface AuthRequest extends Request {
  user?: User;
}

// For this demo, we'll use a simple user ID in headers
// In production, this would use proper JWT tokens
export function createAuthMiddleware(storage: any) {
  return async (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authentication error' });
    }
  };
}

export function requireRole(role: string) {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
