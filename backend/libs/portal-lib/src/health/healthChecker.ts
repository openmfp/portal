export interface HealthChecker {
  isHealthy(): Promise<boolean>;
}

export class EmptyHealthChecker implements HealthChecker {
  isHealthy(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
