import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { ServerController } from './server.controller';
import { APP_GUARD } from '@nestjs/core';
import { ServerService } from './server.service';
import { CanActivate } from '@nestjs/common';

describe('ServerController', () => {
  let controller: ServerController;

  const requestMock = {
    querry: {},
  } as unknown as Request;

  const mockServerService = {
    getAllServerFromUserId: jest.fn(() => []),
    createServer: jest.fn((userId, createServerDto) => ({ id: 'newServerId', ...createServerDto })),
    deleteServerFromId: jest.fn((userId) => ({ message: 'Server deleted successfully' })),
  };

  class MockAuthGuard implements CanActivate {
    canActivate = jest.fn(() => true);
  }

  beforeEach(async () => {
    const authGuardMock: CanActivate = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServerController],
      providers: [
        {
          provide: ServerService,
          useValue: mockServerService,
        },
      ],
    })
      .overrideGuard(AuthGuard).useClass(MockAuthGuard)
      .compile();

    controller = module.get<ServerController>(ServerController);
  });

  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('getMyServers', () => {
  //   it('should return a list of all servers associated', () => {
  //     controller.getMyServers(requestMock);
  //   });
  // });

});
