import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { CanActivate } from '@nestjs/common';

describe('GroupController', () => {
  let controller: GroupController;

  const mockGroupService = {
    getAllGroupFromUserId: jest.fn(() => []),
    createGroup: jest.fn((userId, createGroupDto) => ({
      id: 'newGroupId',
      ...createGroupDto,
    })),
    deleteGroupFromId: jest.fn(() => ({
      message: 'Group deleted successfully',
    })),
  };

  class MockAuthGuard implements CanActivate {
    canActivate = jest.fn(() => true);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    controller = module.get<GroupController>(GroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getMyGroups with the right id when using GET on /Group', async () => {
    const reqMock = { user: { id: 'someUserId' } } as any;
    await controller.getMyGroups(reqMock);
    expect(mockGroupService.getAllGroupFromUserId).toHaveBeenCalledWith(
      'someUserId',
    );
  });

  it('should call createGroup with the right id and info when using POST on /Group', async () => {
    const reqMock = { user: { id: 'someUserId' } } as any;
    const createDto = {
      name: 'Test Group',
      description: 'A Group for testing',
    };
    await controller.createGroup(reqMock, createDto as any);
    expect(mockGroupService.createGroup).toHaveBeenCalledWith(
      'someUserId',
      createDto,
    );
  });

  it('should call deleteGroup using POST on /Group', async () => {
    const reqMock = { Group: { id: 'someGroupId' } } as any;
    const deleteDto = {
      groupID: 'someGroupId',
    };
    
    await controller.deleteGroup(reqMock, deleteDto as any);
    expect(mockGroupService.deleteGroupFromId).toHaveBeenCalledWith(
      'someGroupId',
    );
  });
});
