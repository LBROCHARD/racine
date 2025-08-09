import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { CanActivate } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateGroupDto } from 'src/dtos/createGroup.dto';

describe('GroupService', () => {
  let service: GroupService;
  let prisma: PrismaService;

  class MockAuthGuard implements CanActivate {
    canActivate = jest.fn(() => true);
  }

  const prismaMock = {
    group: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    groupMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    service = module.get<GroupService>(GroupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGroupFromId', () => {
    it('should return the correct group', async () => {
      const groupId = 'someGroupId';
      const expectedGroup = {
        id: groupId,
        groupName: 'Test Group',
        creatorId: 'user1',
      };

      prismaMock.group.findUnique.mockResolvedValue(expectedGroup);
      const result = await service.getGroupFromId(groupId);

      expect(result).toEqual(expectedGroup);
      expect(prisma.group.findUnique).toHaveBeenCalledWith({
        where: { id: groupId },
      });
      expect(prisma.group.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null if group not found', async () => {
      const groupId = 'nonExistentId';
      prismaMock.group.findUnique.mockResolvedValue(null);

      const result = await service.getGroupFromId(groupId);

      expect(result).toBeNull();
      expect(prisma.group.findUnique).toHaveBeenCalledWith({
        where: { id: groupId },
      });
    });
  });

  describe('getAllGroupFromUserId', () => {
    it('should return all groups for a given user ID', async () => {
      const userId = 'someUserId';
      const expectedGroups = [
        { id: 's1', groupName: 'Group 1', creatorId: userId },
        { id: 's2', groupName: 'Group 2', creatorId: userId },
      ];

      const mockGroupMembers = [
        { id: 'member1', userId: userId, groupId: 's1', group: expectedGroups[0] },
        { id: 'member2', userId: userId, groupId: 's2', group: expectedGroups[1] },
      ];

      prismaMock.groupMember.findMany.mockResolvedValue(mockGroupMembers);

      const result = await service.getAllGroupFromUserId(userId);

      expect(result).toEqual(expectedGroups);
      expect(prisma.groupMember.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        include: { group: true },
      });
      expect(prisma.groupMember.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no groups found for user', async () => {
      const userId = 'someUserId';
      prismaMock.groupMember.findMany.mockResolvedValue([]);

      const result = await service.getAllGroupFromUserId(userId);

      expect(result).toEqual([]);
      expect(prisma.groupMember.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        include: { group: true },
      });
    });
  });

  describe('createGroup', () => {
    it('should create and return a new group', async () => {
      const userId = 'someUserId';
      const createGroupDto: CreateGroupDto = {
        groupName: 'New Test Group',
        groupColor: '#FFFFFF',
      };
      const createdGroup = {
        id: 'someGroupUUID',
        ...createGroupDto,
        creatorId: userId,
      };

      prismaMock.group.create.mockResolvedValue(createdGroup);

      const result = await service.createGroup(userId, createGroupDto);

      expect(result).toEqual(createdGroup);
      expect(prisma.group.create).toHaveBeenCalledWith({
        data: {
          groupName: createGroupDto.groupName,
          groupColor: createGroupDto.groupColor,
          creatorId: userId,
        },
      });
      expect(prisma.group.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteGroupFromId', () => {
    it('should delete the correct group and return the deleted group', async () => {
      const groupId = 'SomeGroupId';
      const deletedGroup = {
        id: groupId,
        groupName: 'Group to be deleted',
        creatorId: 'SomeUserId',
      };

      prismaMock.group.delete.mockResolvedValue(deletedGroup);

      const result = await service.deleteGroupFromId(groupId);

      expect(result).toEqual(deletedGroup);
      expect(prisma.group.delete).toHaveBeenCalledWith({
        where: { id: groupId },
      });
      expect(prisma.group.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if group to delete is not found (Prisma error)', async () => {
      const groupId = 'SomeNonExistantGroupId';
      const error = new Error('Group not found for deletion');

      // Simuler une erreur de Prisma, par exemple RecordNotFound
      prismaMock.group.delete.mockRejectedValue(error);

      await expect(service.deleteGroupFromId(groupId)).rejects.toThrow(error);
      expect(prisma.group.delete).toHaveBeenCalledWith({
        where: { id: groupId },
      });
    });
  });
});
