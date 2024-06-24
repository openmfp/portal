import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { EnvService } from '../env/env.service';
import { mock, MockProxy } from 'jest-mock-extended';
import { Logger } from '@nestjs/common';
import { HEALTH_CHECKER_INJECTION_TOKEN } from '../injectionTokens';
import { HealthChecker } from './healthChecker';
describe('HealthController', () => {
  let controller: HealthController;
  let envService: EnvService;
  let healthChecker: MockProxy<HealthChecker>;
  let module: TestingModule;

  beforeEach(async () => {
    jest.useFakeTimers();
    healthChecker = mock<HealthChecker>();
    module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        EnvService,
        Logger,
        {
          provide: HEALTH_CHECKER_INJECTION_TOKEN,
          useValue: healthChecker,
        },
      ],
    }).compile();
    controller = module.get<HealthController>(HealthController);
    envService = module.get<EnvService>(EnvService);
  });

  afterEach(async () => {
    jest.useRealTimers();
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', function () {
    beforeEach(function () {
      jest.spyOn(envService, 'getEnv').mockReturnValue({
        gitHubSettingsWithSecrets: {},
        validWebcomponentUrls: ['ab', 'cd'],
        developmentInstance: false,
        qualtricsSiteInterceptUrl: '',
        qualtricsId: '',
        minimalPluginVersion: 0,
        protocol: 'http',
        releaseNamespace: '',
        extensionManagerApiUrl: '',
        tenantId: '',
        healthCheckInterval: 0,
        idpNames: [],
        frontendPort: '',
      });
    });

    it('should not be healthy if the checker returns false', async () => {
      healthChecker.isHealthy.mockResolvedValue(false);

      await expect(controller.getHealth()).rejects.toThrow(
        'Application health checker reported not healthy'
      );
    });

    it('should be healthy', async () => {
      healthChecker.isHealthy.mockReturnValue(Promise.resolve(true));
      jest.advanceTimersByTime(2000);
      // also tick the promises once, so the health check can show the new result
      await Promise.resolve();

      await expect(controller.getHealth()).resolves.toBeFalsy();
    });

    it('flickering health', async () => {
      // start unhealthy
      healthChecker.isHealthy.mockReturnValue(Promise.resolve(false));

      await expect(controller.getHealth()).rejects.toThrow(
        'Application health checker reported not healthy'
      );

      // be healthy again
      healthChecker.isHealthy.mockReturnValue(Promise.resolve(true));
      jest.advanceTimersByTime(2000);
      // also tick the promises once, so the health check can show the new result
      await Promise.resolve();

      await expect(controller.getHealth()).resolves.toBeFalsy();

      // return to unhealthy
      healthChecker.isHealthy.mockReturnValue(Promise.resolve(false));
      jest.advanceTimersByTime(2000);
      // also tick the promises once, so the health check can show the new result
      await Promise.resolve();

      await expect(controller.getHealth()).rejects.toThrow(
        'Application health checker reported not healthy'
      );
    });
  });
});
