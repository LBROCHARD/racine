import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from 'src/dtos/createUser.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: createUserDto,
      omit: {
        password: true,
      },
    });
  }

  async findOneUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findOneUserByUsername(username: string) {
    return await this.prisma.user.findUnique({ where: { username } });
  }

  async deleteUser(idOfUserToDelete: string) {
    return await this.prisma.user.delete({ where: { id: idOfUserToDelete } });
  }
}
