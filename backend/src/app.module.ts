import { Module } from '@nestjs/common';
import { PortalModule } from '@openmfp/portal-lib';
import { join } from 'path';
import { KubernetesServiceProviders } from './serviceProviders/kubernetesServiceProviders';

@Module({
  imports: [PortalModule.create({
    frontendDistSources: join(__dirname, '../..', 'frontend/dist/frontend'),
    serviceProviderService: KubernetesServiceProviders,
  })],
  controllers: [],
  providers: [],
})
export class AppModule {}
