import { Request, Response } from 'express';
const deviceService = require('../services/device.service');

export async function findAll(req: Request, res: Response) {
    try {
        const devices = await deviceService.findAll();
        res.json(devices);
    }
    catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({message: `Unknown error ${err.message}`});
    }
}

export async function findOne(req: Request, res: Response) {
    try {
        const devices = await deviceService.findOne();
        if (!devices) {
            return res.status(404).json({message: 'Not found.'});
        }
        res.json(devices)
    }
    catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({message: `Unknown error ${err.message}`});
    }
}

export async function create(req: Request, res: Response) {
    try {
        const device = await deviceService.create(req.body);
        res.status(201).json(device);
    }
    catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({message: `Unknown error ${err.message}`});
    }
}
