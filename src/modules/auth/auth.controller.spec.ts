import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CanActivate } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  class MockAuthGuard implements CanActivate {
    canActivate = jest.fn(() => true);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it.skip('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
