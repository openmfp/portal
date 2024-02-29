import { Test, TestingModule } from '@nestjs/testing';
import { LuigiDataService } from './luigi-data.service';
import { HttpModule } from '@nestjs/axios';

describe('CdmLuigiDataService', () => {
  let service: LuigiDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LuigiDataService],
      imports: [HttpModule],
    }).compile();
    service = module.get<LuigiDataService>(LuigiDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
