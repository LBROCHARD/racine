import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CanActivate } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

describe('UsersService', () => {
  let service: UsersService;
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
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    })
      .overrideGuard(AuthGuard).useClass(MockAuthGuard)
      .compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it.skip('should be defined', () => {
    expect(service).toBeDefined();
  });
});
