import { Test, TestingModule } from '@nestjs/testing';
import { PortalLibService } from './portal-lib.service';

describe('PortalLibService', () => {
  let service: PortalLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortalLibService],
    }).compile();

    service = module.get<PortalLibService>(PortalLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
