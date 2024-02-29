import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import { HEALTH_CHECKER_INJECTION_TOKEN } from '../injectionTokens';
import { HealthChecker } from './healthChecker';

@Controller('/rest/health')
export class HealthController {
  private isHealthy: boolean;
  private readonly healthCheckInterval: number;
  private currentTimeout: NodeJS.Timeout;
  private isInitialized: boolean;

  constructor(
    private envService: EnvService,
    private logger: Logger,
    @Inject(HEALTH_CHECKER_INJECTION_TOKEN)
    private healthChecker: HealthChecker
  ) {
    this.isHealthy = false;
    this.healthCheckInterval =
      this.envService.getEnv().healthCheckInterval || 2000;
    this.isInitialized = false;
  }

  @Get()
  async getHealth(): Promise<void> {
    if (!this.isInitialized) {
      await this.performCheck();
    }

    if (this.isHealthy) {
      this.logger.verbose('health check executed successfully');
    } else {
      throw new Error('Application health checker reported not healthy');
    }
  }

  onModuleDestroy(): void {
    clearTimeout(this.currentTimeout);
  }

  private async performCheck() {
    this.isInitialized = true;

    try {
      this.isHealthy = await this.healthChecker.isHealthy();
      if (!this.isHealthy) {
        this.logger.error('health checker returned false');
      }
    } catch (e) {
      this.logger.error(`health check error: ${String(e)}`);
      this.isHealthy = false;
    }

    this.currentTimeout = setTimeout(() => {
      void this.performCheck();
    }, this.healthCheckInterval);
  }
}
