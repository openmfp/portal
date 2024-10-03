import { NgModule } from '@angular/core';
import {
  PortalComponent,
  PortalModule,
  PortalModuleOptions,
} from '@openmfp/portal-ui-lib';
import { ApeiroraStaticSettingsConfigService } from './services/apeirora-static-settings-config.service';

const portalOptions: PortalModuleOptions = {
  staticSettingsConfigService: ApeiroraStaticSettingsConfigService,
};

@NgModule({
  imports: [PortalModule.forRoot(portalOptions)],
  bootstrap: [PortalComponent],
})
export class AppModule {}
