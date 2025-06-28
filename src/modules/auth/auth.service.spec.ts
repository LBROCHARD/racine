import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CanActivate } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthService', () => {
  let service: AuthService;

  class MockAuthGuard implements CanActivate {
    canActivate = jest.fn(() => true);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it.skip('should be defined', () => {
    expect(service).toBeDefined();
  });
});
