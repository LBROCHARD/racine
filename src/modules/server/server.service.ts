import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateServerDto } from 'src/dtos/createServer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from 'src/dtos/user.dto';

@Injectable()
export class ServerService {
    constructor( private prisma: PrismaService ) {}

    async getServerFromId(serverId: string) {
        return await this.prisma.server.findUnique({ where: {id: serverId}})
    }

    async getAllServerFromUserId(userId: string) {
        return await this.prisma.server.findMany({ where: {creatorId: userId}})
    }

    async createServer(userId: string, createServerDto: CreateServerDto) {
        return await this.prisma.server.create({ 
            data: {
                serverName: createServerDto.serverName, 
                serverColor: createServerDto.serverColor, 
                creatorId: userId} 
        });
    }

    async deleteServerFromId(serverId: string) {
        return await this.prisma.server.delete({ where: { id: serverId } });
    }
}
