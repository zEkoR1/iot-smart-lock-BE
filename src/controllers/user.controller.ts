import { Request, Response } from 'express';
const userService = require('../services/user.service');

export async function findAll(req: Request, res: Response) {
    try {
        const users = await userService.findAll();
        res.json(users);
    }
    catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({message: `Unknown error ${err.message}`});
    }
}

export async function create(req: Request, res: Response) {
    try {
        const user = await userService.create(req.body);
        res.status(201).json(user);
    }
    catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({message: `Unknown error ${err.message}`});
    }
}