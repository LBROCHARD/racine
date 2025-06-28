import { Test, TestingModule } from '@nestjs/testing';
import { ServerService } from './server.service';
import { CanActivate } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateServerDto } from 'src/dtos/createServer.dto';

describe('ServerService', () => {
  let service: ServerService;
  let prisma: PrismaService;

  class MockAuthGuard implements CanActivate {
    canActivate = jest.fn(() => true);
  }

  const prismaMock = {
    server: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServerService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    service = module.get<ServerService>(ServerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getServerFromId', () => {
    it('should return the correct server', async () => {
      const serverId = 'someServerId';
      const expectedServer = {
        id: serverId,
        serverName: 'Test Server',
        creatorId: 'user1',
      };

      prismaMock.server.findUnique.mockResolvedValue(expectedServer);
      const result = await service.getServerFromId(serverId);

      expect(result).toEqual(expectedServer);
      expect(prisma.server.findUnique).toHaveBeenCalledWith({
        where: { id: serverId },
      });
      expect(prisma.server.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null if server not found', async () => {
      const serverId = 'nonExistentId';
      prismaMock.server.findUnique.mockResolvedValue(null);

      const result = await service.getServerFromId(serverId);

      expect(result).toBeNull();
      expect(prisma.server.findUnique).toHaveBeenCalledWith({
        where: { id: serverId },
      });
    });
  });

  describe('getAllServerFromUserId', () => {
    it('should return all servers for a given user ID', async () => {
      const userId = 'someUserId';
      const expectedServers = [
        { id: 's1', serverName: 'Server 1', creatorId: userId },
        { id: 's2', serverName: 'Server 2', creatorId: userId },
      ];

      prismaMock.server.findMany.mockResolvedValue(expectedServers);

      const result = await service.getAllServerFromUserId(userId);

      expect(result).toEqual(expectedServers);
      expect(prisma.server.findMany).toHaveBeenCalledWith({
        where: { creatorId: userId },
      });
      expect(prisma.server.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no servers found for user', async () => {
      const userId = 'someUserId';
      prismaMock.server.findMany.mockResolvedValue([]);

      const result = await service.getAllServerFromUserId(userId);

      expect(result).toEqual([]);
      expect(prisma.server.findMany).toHaveBeenCalledWith({
        where: { creatorId: userId },
      });
    });
  });

  describe('createServer', () => {
    it('should create and return a new server', async () => {
      const userId = 'someUserId';
      const createServerDto: CreateServerDto = {
        serverName: 'New Test Server',
        serverColor: '#FFFFFF',
      };
      const createdServer = {
        id: 'someServerUUID',
        ...createServerDto,
        creatorId: userId,
      };

      prismaMock.server.create.mockResolvedValue(createdServer);

      const result = await service.createServer(userId, createServerDto);

      expect(result).toEqual(createdServer);
      expect(prisma.server.create).toHaveBeenCalledWith({
        data: {
          serverName: createServerDto.serverName,
          serverColor: createServerDto.serverColor,
          creatorId: userId,
        },
      });
      expect(prisma.server.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteServerFromId', () => {
    it('should delete the correct server and return the deleted server', async () => {
      const serverId = 'SomeServerId';
      const deletedServer = {
        id: serverId,
        serverName: 'Server to be deleted',
        creatorId: 'SomeUserId',
      };

      prismaMock.server.delete.mockResolvedValue(deletedServer);

      const result = await service.deleteServerFromId(serverId);

      expect(result).toEqual(deletedServer);
      expect(prisma.server.delete).toHaveBeenCalledWith({
        where: { id: serverId },
      });
      expect(prisma.server.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if server to delete is not found (Prisma error)', async () => {
      const serverId = 'SomeNonExistantServerId';
      const error = new Error('Server not found for deletion');

      // Simuler une erreur de Prisma, par exemple RecordNotFound
      prismaMock.server.delete.mockRejectedValue(error);

      await expect(service.deleteServerFromId(serverId)).rejects.toThrow(error);
      expect(prisma.server.delete).toHaveBeenCalledWith({
        where: { id: serverId },
      });
    });
  });
});
