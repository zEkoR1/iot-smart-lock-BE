import { Request, Response, NextFunction } from 'express';
const deviceService = require('../services/device-auth.service');

export function checkDeviceAuth(prisma: any) {
    return async function deviceAuth(req: Request, res: Response, next: NextFunction) {
        try {
            const apiKey = req.get('X-API-KEY');
            if (!apiKey) {
                return res.status(401).json({error: 'API key required'});
            }

            const device = await deviceService.findOne(apiKey)

            if (!device || !device.isActive) {
                return res.status(403).json({error: 'Access forbidden'});
            }
            (req as any).device = device;
            next();
        } catch (error: unknown) {
            next(error);
        }
    }
}
