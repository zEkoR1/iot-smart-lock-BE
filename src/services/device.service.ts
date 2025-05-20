import { v7 as genUuid } from 'uuid';
import { generateApiKey } from '../utils/apiKeyGenerator';
// Fix the import path to point to the correct location
import { CreateDeviceDto } from '../services/dto/create-device.dto';
const prisma = require('../prisma/prisma-client');

class DeviceService {
    private prisma: any;

    constructor(prismaClient: any) {
        this.prisma = prismaClient;
    }

    findAll() {
        return prisma.device.findMany();
    }

    async findOne(apiKey: string) {
        return prisma.device.findUnique({ where: { apiKey } });
    }

    async create(req: CreateDeviceDto) {
        const apiKey = req.apiKey || generateApiKey(24, 'dev_');
        const device = await this.prisma.device.create({
            data: {
                id: genUuid(),
                name: req.name,
                apiKey: apiKey
            }
        });
        return device;
    }
}

module.exports = new DeviceService(prisma);
