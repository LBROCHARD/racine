import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGroupDto } from 'src/dtos/createGroup.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGroupDto } from 'src/dtos/updateGroup.dto';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async getGroupFromId(groupId: string) {
    return await this.prisma.group.findUnique({ where: { id: groupId } });
  }

  // Gets all the groups created AND joined from that user
  async getAllGroupFromUserId(userId: string) {
    const groupMembers = await this.prisma.groupMember.findMany({
      where: {
        userId: userId,
      },
      include: {
        group: true,
      },
    });

    return groupMembers.map((member) => member.group);
  }

  async createGroup(userId: string, createGroupDto: CreateGroupDto) {
    const newGroup = await this.prisma.group.create({
      data: {
        groupName: createGroupDto.groupName,
        groupColor: createGroupDto.groupColor,
        creatorId: userId,
      },
    });

    // Create a groupMember for all server created, because the creator is also a member
    await this.prisma.groupMember.create({
      data: {
        groupId: newGroup.id,
        userId: userId,
      },
    });
    return newGroup;
  }

  async modifyGroup(updateGroupDto: UpdateGroupDto) {
    return await this.prisma.group.update({
      where: {
        id: updateGroupDto.groupID,
      },
      data: {
        groupName: updateGroupDto.groupName,
        groupColor: updateGroupDto.groupColor,
      },
    });
  }

  async deleteGroupFromId(userId: string, groupId: string) {
    // Check if group and user exist
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    } else if (!group) {
      throw new HttpException('Group not found.', HttpStatus.NOT_FOUND);
    }

    // Delete all members of this group
    await this.prisma.groupMember.deleteMany({
      where: { groupId: groupId },
    });

    // Delete the group
    return await this.prisma.group.delete({ where: { id: groupId } });
  }

  // ---------- Members ----------

  // Gets all members who have a groupMember associeted to that group
  async getAllMembersFromGroupId(groupId: string) {
    const groupMembers = await this.prisma.groupMember.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        user: true,
      },
    });

    return groupMembers.map((member) => member.user);
  }

  async createGroupMember(username: string, groupID: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupID },
    });
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });

    if (!group) {
      throw new HttpException('Group not found.', HttpStatus.NOT_FOUND);
    } else if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.groupMember.create({
      data: {
        groupId: groupID,
        userId: user.id,
      },
    });
  }

  async removeUserFromGroup(username: string, groupID: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupID },
    });
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });

    if (!group) {
      throw new HttpException('Group not found.', HttpStatus.NOT_FOUND);
    } else if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const groupMember = await this.prisma.groupMember.findFirst({
      where: { groupId: groupID, userId: user.id },
    });
    if (!groupMember) {
      throw new HttpException(
        'The member is not a part of that group.',
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.prisma.groupMember.delete({
      where: { id: groupMember.id },
    });
  }
}
