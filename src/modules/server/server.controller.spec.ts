import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { CanActivate } from '@nestjs/common';

describe('ServerController', () => {
  let controller: ServerController;

  const mockServerService = {
    getAllServerFromUserId: jest.fn(() => []),
    createServer: jest.fn((userId, createServerDto) => ({
      id: 'newServerId',
      ...createServerDto,
    })),
    deleteServerFromId: jest.fn(() => ({
      message: 'Server deleted successfully',
    })),
  };

  class MockAuthGuard implements CanActivate {
    canActivate = jest.fn(() => true);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServerController],
      providers: [
        {
          provide: ServerService,
          useValue: mockServerService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    controller = module.get<ServerController>(ServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getMyServers with the right id when using GET on /server', async () => {
    const reqMock = { user: { id: 'someUserId' } } as any;
    await controller.getMyServers(reqMock);
    expect(mockServerService.getAllServerFromUserId).toHaveBeenCalledWith(
      'someUserId',
    );
  });

  it('should call createServer with the right id and info when using POST on /server', async () => {
    const reqMock = { user: { id: 'someUserId' } } as any;
    const createDto = {
      name: 'Test Server',
      description: 'A server for testing',
    };
    await controller.createServer(reqMock, createDto as any);
    expect(mockServerService.createServer).toHaveBeenCalledWith(
      'someUserId',
      createDto,
    );
  });

  it('should call deleteServer using POST on /server', async () => {
    const reqMock = { server: { id: 'someServerId' } } as any;
    const deleteDto = {
      serverID: 'someServerId',
    };
    
    await controller.deleteServer(reqMock, deleteDto as any);
    expect(mockServerService.deleteServerFromId).toHaveBeenCalledWith(
      'someServerId',
    );
  });
});
