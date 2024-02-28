import { Module } from '@nestjs/common';
import { PortalLibService } from './portal-lib.service';

@Module({
  providers: [PortalLibService],
  exports: [PortalLibService],
})
export class PortalLibModule {}
