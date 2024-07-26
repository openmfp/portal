import { Module } from '@nestjs/common';
import { PortalModule } from '@openmfp/portal-lib';
import { join } from 'path';
import { KubernetesServiceProviders } from './serviceProviders/kubernetesServiceProviders';
import { OpenmfpPortalProvider } from './portal-context-provider';

@Module({
  imports: [PortalModule.create({
    frontendDistSources: join(__dirname, '../..', 'frontend/dist/frontend'),
    serviceProviderService: KubernetesServiceProviders,
    portalContextProvider: OpenmfpPortalProvider,
  })],
  controllers: [],
  providers: [],
})
export class AppModule {}
