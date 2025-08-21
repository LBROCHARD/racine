import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { CanActivate, HttpException } from '@nestjs/common';
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
    user: {
      findUnique: jest.fn(),
    },
    group: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    groupPage: {
      deleteMany: jest.fn(),
    },
    page: {
      deleteMany: jest.fn(),
    },
    groupMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
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
      const userId = 'someUserId';
      const groupId = 'SomeGroupId';
      const deletedGroup = {
        id: groupId,
        groupName: 'Group to be deleted',
        creatorId: userId,
      };
      const existingUser = {
        id: userId,
        username: 'testUser',
      };
      const existingGroup = {
        id: groupId,
        groupName: 'Group to be deleted',
        creatorId: 'someOtherUserId',
      };
      
      prismaMock.user.findUnique.mockResolvedValue(existingUser);
      prismaMock.group.findUnique.mockResolvedValue(existingGroup);
      
      prismaMock.groupMember.deleteMany.mockResolvedValue({ count: 5 }); 
      prismaMock.group.delete.mockResolvedValue(deletedGroup);

      const result = await service.deleteGroupFromId(userId, groupId);

      expect(result).toEqual(deletedGroup);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prismaMock.group.findUnique).toHaveBeenCalledWith({ where: { id: groupId } });
      expect(prismaMock.groupMember.deleteMany).toHaveBeenCalledWith({ where: { groupId: groupId } });
      expect(prismaMock.group.delete).toHaveBeenCalledWith({ where: { id: groupId } });
      expect(prismaMock.group.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException if group is not found', async () => {
      const userId = 'someUserId';
      const groupId = 'SomeNonExistentGroupId';

      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        username: 'testUser',
      });

      prismaMock.group.findUnique.mockResolvedValue(null);

      await expect(service.deleteGroupFromId(userId, groupId)).rejects.toThrow(new HttpException('Group not found.', 404));

      expect(prismaMock.group.delete).not.toHaveBeenCalled();
      expect(prismaMock.groupMember.deleteMany).not.toHaveBeenCalled();
    });

    it('should throw HttpException if user is not found', async () => {
      const userId = 'SomeNonExistentUserId';
      const groupId = 'SomeGroupId';
      
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteGroupFromId(userId, groupId)).rejects.toThrow(new HttpException('User not found.', 404));

      expect(prismaMock.group.delete).not.toHaveBeenCalled();
      expect(prismaMock.groupMember.deleteMany).not.toHaveBeenCalled();
    });
  });

});
