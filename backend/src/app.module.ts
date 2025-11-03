import { AccountEntityContextProvider } from './entity-context-provider/account-entity-context-provider.service.js';
import { Module } from '@nestjs/common';
import { PortalModule, PortalModuleOptions } from '@openmfp/portal-server-lib';
import { config } from 'dotenv';
import * as path from 'node:path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

config({ path: './.env' });

const portalOptions: PortalModuleOptions = {
  frontendDistSources: path.join(
    __dirname,
    '../..',
    'frontend/dist/frontend/browser',
  ),
  entityContextProviders: {
    account: AccountEntityContextProvider,
  },
  additionalProviders: [AccountEntityContextProvider],
};

@Module({
  imports: [PortalModule.create(portalOptions)],
})
export class AppModule {}
