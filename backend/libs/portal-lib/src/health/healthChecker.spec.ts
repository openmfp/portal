import { Test, TestingModule } from '@nestjs/testing';
import { EmptyHealthChecker, HealthChecker } from './healthChecker';
describe('EmptyHealthChecker', () => {
  let sut: HealthChecker;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [EmptyHealthChecker],
    }).compile();
    sut = module.get<HealthChecker>(EmptyHealthChecker);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getHealth', () => {
    it('should be healthy', async () => {
      await expect(sut.isHealthy()).resolves.toBeTruthy();
    });
  });
});
