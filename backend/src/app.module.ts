import { Module } from '@nestjs/common';
import { PortalModule } from '@openmfp/portal-lib';
import { join } from 'path';
import { LocalServiceProviderService } from './serviceProviders/localServiceProviders';

@Module({
  imports: [PortalModule.create({
    frontendDistSources: join(__dirname, '../..', 'frontend/dist/frontend'),
    serviceProviderService: LocalServiceProviderService,
  })],
  controllers: [],
  providers: [],
})
export class AppModule {}
