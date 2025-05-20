import { v7 as genUuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
const prisma = require('../prisma/prisma-client');

class UserService {
    private prisma: any;

    constructor(prismaClient: any) {
        this.prisma = prismaClient;
    }
    
    findAll() {
        return this.prisma.user.findMany();
    }
    
    create(req: any) {
        // Create a user with all necessary fields explicitly included
        return this.prisma.user.create({
            data: {
                id: genUuid(),
                name: req.name,
                fingerprint: req.fingerprint,
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
