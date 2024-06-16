import { Module } from '@nestjs/common';
import { join } from 'path';
import { PortalModule, PortalModuleOptions } from '@openmfp/portal-server-lib';
import { LocalServiceProviderService } from './service-providers/localServiceProviders';

const portalOptions: PortalModuleOptions = {
  frontendDistSources: join(__dirname, '../..', 'frontend/dist/frontend'),
  serviceProviderService: LocalServiceProviderService,
};

@Module({
  imports: [PortalModule.create(portalOptions)],
  controllers: [],
  providers: [],
})
export class AppModule {}
