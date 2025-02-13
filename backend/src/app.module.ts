import { Module } from '@nestjs/common';
import { PortalModule, PortalModuleOptions } from '@openmfp/portal-server-lib';
import * as path from 'node:path';
import { AccountEntityContextProvider } from './entity-context-provider/account-entity-context-provider.service.js';
import { KubernetesServiceProvidersService } from './service-providers/kubernetes-service-providers.service.js';
import { OpenmfpPortalProvider } from './service-providers/portal-context-provider.js';
import { config } from 'dotenv';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

config({ path: './.env' });

const portalOptions: PortalModuleOptions = {
  frontendDistSources: path.join(
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
