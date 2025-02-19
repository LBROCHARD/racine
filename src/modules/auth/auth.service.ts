import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/dtos/createUser.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(username: string, pass: string): Promise<{ access_token: string }> {
        const user = await this.usersService.findOneUserByUsername(username);
        
        if (user?.password !== pass) {
            throw new UnauthorizedException();
        }
        
        const payload = { sub: user.id, username: user.username };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    
    async signUp(createUserDto: CreateUserDto) {
        const usernameExist = await this.usersService.findOneUserByUsername(createUserDto.username);
        if (usernameExist) {
            throw new BadRequestException("Username already exists");
        }

        const emailExist = await this.usersService.findOneUserByEmail(createUserDto.email);
        if (emailExist) {
            throw new BadRequestException("Email already used for an account");
        }

        // const hashedPassword = await this.hashPassword(registerDto.password);

        const user = await this.usersService.createUser(createUserDto);

        return user;
    }


    // async hashPassword(password: string): Promise<string> {
    //     return await bcrypt.hash(password, 10);
    // }
}
