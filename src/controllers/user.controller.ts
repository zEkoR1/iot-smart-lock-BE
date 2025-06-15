import { Request, Response } from 'express';
const userService = require('../services/user.service');

export async function findAll(req: Request, res: Response) {
    const users = await userService.findAll();
    res.json(users);
}

export async function create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    res.status(201).json(user);
}

export async function deleteUser(req: Request, res: Response) {
    const userId = req.params.id;
    const user = await userService.delete({ id: userId });
    res.status(200).json({ message: 'User deleted successfully', user });
}
