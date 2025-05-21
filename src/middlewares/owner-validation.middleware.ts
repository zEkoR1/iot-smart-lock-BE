import { Request, Response, NextFunction } from 'express';
const userService = require('../services/user.service');

export function checkOwner(req: Request, res: Response, next: NextFunction) {


    const authenticatedUserId = req.user?.id; 
    
    if (!authenticatedUserId) {
        return res.status(401).json({ message: 'Unauthorized: Authentication required' });
    }
    

    const targetUserId = req.params.id;
    

    if (authenticatedUserId !== targetUserId) {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own user account' });
    }
    

    next();
}
