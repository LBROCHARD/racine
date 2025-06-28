import { Body, Controller, Get, HttpCode, Request, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ServerService } from './server.service';
import { CreateServerDto } from 'src/dtos/createServer.dto';
import { UsersService } from '../users/users.service';

@Controller('server')
export class ServerController {
    constructor(private serverService: ServerService) {}
    
    @UseGuards(AuthGuard)
    @Get()
    getMyServers(@Request() req) {
        return this.serverService.getAllServerFromUserId(req.user.id);
    }
    
    @UseGuards(AuthGuard)
    @Post()
    async createServer(@Request() req, @Body() createServerDto: CreateServerDto) {
        try {
            return this.serverService.createServer(req.user.id, createServerDto);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Failed to create server",
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @UseGuards(AuthGuard)
    @Post()
    deleteServer(@Request() req) {
        try {
            return this.serverService.deleteServerFromId(req.server.id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Failed to delete server",
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

}
