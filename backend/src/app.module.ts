import { Module } from '@nestjs/common';
import { PortalModule } from '@openmfp/portal-lib';
import { join } from 'path';

@Module({
  imports: [PortalModule.create({
    frontendDistSources: join(__dirname, '../..', 'frontend/dist/frontend')
  })],
  controllers: [],
  providers: [],
})
export class AppModule {}
