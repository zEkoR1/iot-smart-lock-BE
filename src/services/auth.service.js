const prisma = require('../prisma/prisma-client')

class UserService  {
    constructor(prismaClient){
        this.prisma = prismaClient

    }

    findAll(){
       return this.prisma.user.findMany()
    }
}
module.exports = new UserService(prisma);
