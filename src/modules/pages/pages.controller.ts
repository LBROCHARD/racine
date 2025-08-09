import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Get,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from 'src/types/request.interface';
import { CreatePageDto } from 'src/dtos/createPage.dto';
import { DeletePageDto } from 'src/dtos/deletePage.dto';
import { UpdatePageDto } from 'src/dtos/updatePage.dto';
import { UpdatePageContentDto } from 'src/dtos/updatePageContent.dto';

@Controller('pages')
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @UseGuards(AuthGuard)
  @Get('from-group/:id')
  getPagesFromGroupId(
    @Request() req: AuthenticatedRequest,
    @Param('id') groupId: string,
  ) {
    return this.pagesService.getAllPagesFromGroupId(req.user.id, groupId);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  getPagesFromPageId(
    @Request() req: AuthenticatedRequest,
    @Param('id') pageId: string,
  ) {
    return this.pagesService.getPageFromId(req.user.id, pageId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createPage(
    @Request() req: AuthenticatedRequest,
    @Body() createPageDto: CreatePageDto,
  ) {
    try {
      return this.pagesService.createPage(req.user.id, createPageDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to create page',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Put()
  async modifyPage(
    @Request() req: AuthenticatedRequest,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    try {
      return this.pagesService.modifyPage(req.user.id, updatePageDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to modify page',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Put('/content')
  async updatePageContent(
    @Request() req: AuthenticatedRequest,
    @Body() updatePageContentDto: UpdatePageContentDto,
  ) {
    try {
      return this.pagesService.updatePageContent(
        req.user.id,
        updatePageContentDto,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to update page content',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete()
  async deletePage(
    @Request() req: AuthenticatedRequest,
    @Body() deletePageDto: DeletePageDto,
  ) {
    try {
      return this.pagesService.deletePage(req.user.id, deletePageDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to delete page',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
