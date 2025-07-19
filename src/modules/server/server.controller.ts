import {
  Body,
  Controller,
  Get,
  Request,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ServerService } from './server.service';
import { CreateServerDto } from 'src/dtos/createServer.dto';
import { AuthenticatedRequest } from 'src/types/request.interface';
import { DeleteServerDto } from 'src/dtos/deleteServer.dto';

@Controller('server')
export class ServerController {
  constructor(private serverService: ServerService) {}

  @UseGuards(AuthGuard)
  @Get()
  getMyServers(@Request() req: AuthenticatedRequest) {
    return this.serverService.getAllServerFromUserId(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createServer(
    @Request() req: AuthenticatedRequest,
    @Body() createServerDto: CreateServerDto,
  ) {
    try {
      return this.serverService.createServer(req.user.id, createServerDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to create server',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  deleteServer(
    @Request() req: AuthenticatedRequest,
    @Body() deleteServerDto: DeleteServerDto,
  ) {
    try {
      return this.serverService.deleteServerFromId(deleteServerDto.serverID);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to delete server',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
