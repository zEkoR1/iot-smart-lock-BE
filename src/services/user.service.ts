import { v7 as genUuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '../utils/errors/bad-request-error';
const prisma = require('../prisma/prisma-client');

class UserService {
    private prisma: any;

    constructor(prismaClient: any) {
        this.prisma = prismaClient;
    }

    async findAll() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                devices: {
                    select: {
                        role: true,
                    },
                },
            },
        });

        return users.map((user: { id: any; name: any; devices: { role: any }[] }) => ({
            id: user.id,
            name: user.name,
            role: user.devices[0]?.role || null,
        }));
    }

    async create(req: any) {
        // Create a user with all necessary fields explicitly included
        const fingerprint = 'placeholder'
        const device = await this.prisma.device.findUnique({where: {id: req.deviceId}})
        if (!device){
            throw new BadRequestError('Device not found');
        }
        return this.prisma.user.create({
            data: {
                id: genUuid(),
                name: req.name,
                fingerprint: fingerprint,
                face: req.face,
                devices: {
                    create: {
                        device: {
                            connect: { id: req.deviceId }
                        },
                        role: req.role
                    }
                }
            }
        });
    }

    delete(req: any) {
        return this.prisma.user.delete({
            where: { id: req.id }
        });
    }
}

// Export as a singleton instance
const userService = new UserService(prisma);
module.exports = userService;
