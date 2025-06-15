import { Request, Response, NextFunction } from 'express';
const userService = require('../services/user.service');

export function checkOwner(req: Request, res: Response, next: NextFunction) {

    // This is a pragmatic cast to unblock a stubborn build-environment issue.
    // The type `Request` should be globally augmented to include `user`,
    // but the build environment is not picking up the type definition.
    const authenticatedUserId = (req as any).user?.id; 
    
    if (!authenticatedUserId) {
        return res.status(401).json({ message: 'Unauthorized: Authentication required' });
    }
    

    const targetUserId = req.params.id;
    

    if (authenticatedUserId !== targetUserId) {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own user account' });
    }
    

    next();
}
