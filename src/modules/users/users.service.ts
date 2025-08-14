import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from 'src/dtos/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    return await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      },
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
