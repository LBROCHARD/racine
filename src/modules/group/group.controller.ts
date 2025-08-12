import {
  Body,
  Controller,
  Get,
  Request,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { GroupService } from './group.service';
import { CreateGroupDto } from 'src/dtos/createGroup.dto';
import { AuthenticatedRequest } from 'src/types/request.interface';
import { DeleteGroupDto } from 'src/dtos/deleteGroup.dto';
import { UpdateGroupDto } from 'src/dtos/updateGroup.dto';
import { AddMemberToGroupDto } from 'src/dtos/addMemberToGroup.dto';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @UseGuards(AuthGuard)
  @Get()
  getMyGroups(@Request() req: AuthenticatedRequest) {
    return this.groupService.getAllGroupFromUserId(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createGroup(
    @Request() req: AuthenticatedRequest,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    try {
      return this.groupService.createGroup(req.user.id, createGroupDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to create group',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateGroup(
    @Request() req: AuthenticatedRequest,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    try {
      return this.groupService.modifyGroup(updateGroupDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to modify group',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete()
  deleteGroup(
    @Request() req: AuthenticatedRequest,
    @Body() deleteGroupDto: DeleteGroupDto,
  ) {
    try {
      return this.groupService.deleteGroupFromId(req.user.id, deleteGroupDto.groupID);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to delete group',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ---------- Members ----------

  @UseGuards(AuthGuard)
  @Get('/member/:id')
  getGroupMembers(
    @Request() req: AuthenticatedRequest,
    @Param('id') groupID: string,
  ) {
    return this.groupService.getAllMembersFromGroupId(groupID);
  }

  @UseGuards(AuthGuard)
  @Post('/member')
  async addUsername(
    @Request() req: AuthenticatedRequest,
    @Body() addMemberToGroupDto: AddMemberToGroupDto,
  ) {
    try {
      return this.groupService.createGroupMember(
        addMemberToGroupDto.username,
        addMemberToGroupDto.groupID,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to add member to the group',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/member')
  async removeMemberFromGroup(
    @Request() req: AuthenticatedRequest,
    @Body() addMemberToGroupDto: AddMemberToGroupDto,
  ) {
    try {
      return this.groupService.removeUserFromGroup(
        addMemberToGroupDto.username,
        addMemberToGroupDto.groupID,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Failed to remove member to the group',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
