import { Test, TestingModule } from '@nestjs/testing';
import { PagesService } from './pages.service';

describe('PagesService', () => {
  let service: PagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagesService],
    }).compile();

    service = module.get<PagesService>(PagesService);
  });

  it.skip('should be defined', () => {
    expect(service).toBeDefined();
  });
});
