import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/dtos/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(createUserDto: CreateUserDto): Promise<{
    access_token: string;
    username: string;
    email: string;
    id: string;
  }> {
    let user = await this.usersService.findOneUserByEmail(createUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(createUserDto.password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, username: user.username, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      username: payload.username,
      email: payload.email,
      id: payload.id,
    };
  }

  async signUp(createUserDto: CreateUserDto) {
    const usernameExist = await this.usersService.findOneUserByUsername(
      createUserDto.username,
    );
    if (usernameExist) {
      throw new BadRequestException('Username already exists');
    }

    const emailExist = await this.usersService.findOneUserByEmail(
      createUserDto.email,
    );
    if (emailExist) {
      throw new BadRequestException('Email already used for an account');
    }

    const user = await this.usersService.createUser(createUserDto);

    return user;
  }
}
