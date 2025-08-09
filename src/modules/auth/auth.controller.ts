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
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CreateUserDto } from 'src/dtos/createUser.dto';
import { AuthenticatedRequest } from 'src/types/request.interface';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() createUserDto: CreateUserDto) {
    try {
      return this.authService.signIn(createUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Failed to log in',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
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

  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  async deleteAccount(
    @Param('id') userIdToDelete: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const connectedUserId = req.user.id;

    if (connectedUserId !== userIdToDelete) {
      throw new HttpException(
        "You cannot delete an account that isn't yours.",
        HttpStatus.FORBIDDEN,
      );
    } else {
      await this.userService.deleteUser(userIdToDelete);
      return { message: 'User successfully deleted.' };
    }
  }
}
