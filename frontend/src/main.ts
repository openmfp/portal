import { bootstrapApplication } from '@angular/platform-browser';
import {
  PortalComponent,
  PortalOptions,
  providePortal,
} from '@openmfp/portal-ui-lib';
import { ApeiroraStaticSettingsConfigService } from './app/services/apeirora-static-settings-config.service';

const portalOptions: PortalOptions = {
  staticSettingsConfigService: ApeiroraStaticSettingsConfigService,
};

bootstrapApplication(PortalComponent, {
  providers: [providePortal(portalOptions)],
}).catch((err) => console.error(err));
