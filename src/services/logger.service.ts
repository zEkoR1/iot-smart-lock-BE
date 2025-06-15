import { Prisma, PrismaClient } from '@prisma/client';
import { CreateLogDto } from './dto/create-log.dto';

const prisma = new PrismaClient();

export class LoggerService {
    async create(logData: CreateLogDto) {
        const { status, message, ipAddress, userId, deviceId } = logData;

        return prisma.log.create({
            data: {
                status,
                message: message ?? undefined,
                ipAddress: ipAddress ?? undefined,

                userId:   userId   ?? null,
                deviceId: deviceId ?? null,
            },
        });
    }

    async findAll() {
        return prisma.log.findMany();
    }
}
