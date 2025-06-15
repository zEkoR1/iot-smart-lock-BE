import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

const loggerService = new LoggerService();

export class LogController {
    async create(req: Request, res: Response) {
        try {
            const log = await loggerService.create(req.body);
            res.status(201).json(log);
        } catch (error) {
            res.status(500).json({ message: 'Error creating log' });
        }
    }

    async   findAll(req: Request, res: Response) {
        try {
            const logs = await loggerService.findAll();
            res.status(200).json(logs);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching logs' });
        }
    }
}
