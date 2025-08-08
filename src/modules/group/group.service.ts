import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from 'src/dtos/createGroup.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGroupDto } from 'src/dtos/updateGroup.dto';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async getGroupFromId(groupId: string) {
    return await this.prisma.group.findUnique({ where: { id: groupId } });
  }

  async getAllGroupFromUserId(userId: string) {
    return await this.prisma.group.findMany({ where: { creatorId: userId } });
  }

  async createGroup(userId: string, createGroupDto: CreateGroupDto) {
    return await this.prisma.group.create({
      data: {
        groupName: createGroupDto.groupName,
        groupColor: createGroupDto.groupColor,
        creatorId: userId,
      },
    });
  }

  async modifyGroup(updateGroupDto: UpdateGroupDto) {
    return await this.prisma.group.update({
      where: {
        id: updateGroupDto.groupID
      },
      data: {
        groupName: updateGroupDto.groupName,
        groupColor: updateGroupDto.groupColor,
      },
    });
  }

  async deleteGroupFromId(groupId: string) {
    return await this.prisma.group.delete({ where: { id: groupId } });
  }
}
