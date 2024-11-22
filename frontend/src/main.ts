import { bootstrapApplication } from '@angular/platform-browser';
import {
  PortalComponent,
  PortalOptions,
  providePortal,
} from '@openmfp/portal-ui-lib';
import { StaticSettingsConfigServiceImpl } from './app/services/static-settings-config.service';

const portalOptions: PortalOptions = {
  staticSettingsConfigService: StaticSettingsConfigServiceImpl,
};

bootstrapApplication(PortalComponent, {
  providers: [providePortal(portalOptions)],
}).catch((err) => console.error(err));
