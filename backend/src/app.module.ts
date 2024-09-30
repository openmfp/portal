import { Module } from '@nestjs/common';
import { join } from 'path';
import { PortalModule, PortalModuleOptions } from '@openmfp/portal-server-lib';
import { KubernetesServiceProviders } from './serviceProviders/kubernetesServiceProviders';
import { OpenmfpPortalProvider } from './serviceProviders/portal-context-provider';
import { config } from 'dotenv';

config({ path: './.env' });

const portalOptions: PortalModuleOptions = {
  frontendDistSources: join(__dirname, '../..', 'frontend/dist/frontend'),
  serviceProviderService: KubernetesServiceProviders,
  portalContextProvider: OpenmfpPortalProvider,
};

@Module({
  imports: [PortalModule.create(portalOptions)],
})
export class AppModule {}
