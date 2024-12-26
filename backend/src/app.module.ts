import { Module } from '@nestjs/common';
import { PortalModule, PortalModuleOptions } from '@openmfp/portal-server-lib';
import { join } from 'path';
import { AccountEntityContextProvider } from './entity-context-provider/account-entity-context-provider.service';
import { KubernetesServiceProvidersService } from './service-providers/kubernetes-service-providers.service';
import { OpenmfpPortalProvider } from './service-providers/portal-context-provider';
import { config } from 'dotenv';

config({ path: './.env' });

const portalOptions: PortalModuleOptions = {
  frontendDistSources: join(
    __dirname,
    '../..',
    'frontend/dist/frontend/browser'
  ),
  entityContextProviders: {
    account: AccountEntityContextProvider,
  },
  additionalProviders: [AccountEntityContextProvider],
  serviceProviderService: KubernetesServiceProvidersService,
  portalContextProvider: OpenmfpPortalProvider,
};

@Module({
  imports: [PortalModule.create(portalOptions)],
})
export class AppModule {}
