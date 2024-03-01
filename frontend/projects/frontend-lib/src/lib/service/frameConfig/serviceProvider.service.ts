import { Injectable } from '@angular/core';
import { ServiceProvider, PortalConfig } from '../../../../../../../backend/libs/portal-lib/src/luigiNode';
import { RequestHeadersService } from './requestHeaders.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceProviderService {
  constructor(
    private requestHeadersService: RequestHeadersService,
    private configService: ConfigService
  ) {}

  clearCache(): void {
    this.configService.clearEntityConfigCache();
  }

  async getRawConfigsForTenant(): Promise<ServiceProvider[]> {
    return this.configService
      .getPortalConfig()
      .then((frameConfig: PortalConfig) => frameConfig.providers || []);
  }

  async getRawConfigsForEntity(
    entity: string,
    context?: Record<string, string>
  ): Promise<ServiceProvider[]> {
    return this.configService
      .getEntityConfig(entity, context)
      .then((entityConfig) => entityConfig.providers || []);
  }
}
