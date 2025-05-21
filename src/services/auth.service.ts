import {PrismaClient} from "@prisma/client";

const prisma = require('../prisma/prisma-client');


class AuthService {
    private prisma: PrismaClient;

    constructor(prismaClient: any) {
        this.prisma = prismaClient;
    }

}

module.exports = new AuthService(prisma);
