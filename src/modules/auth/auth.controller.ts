import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CreateUserDto } from 'src/dtos/createUser.dto';
import { AuthenticatedRequest } from 'src/types/request.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() createUserDto: CreateUserDto) {
    return this.authService.signIn(
      createUserDto.username,
      createUserDto.password,
    );
  }

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    try {
      return this.authService.signUp(createUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to sign up',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
