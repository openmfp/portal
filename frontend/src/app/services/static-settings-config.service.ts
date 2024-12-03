import { StaticSettingsConfigService } from '@openmfp/portal-ui-lib';

export class StaticSettingsConfigServiceImpl
  implements StaticSettingsConfigService
{
  getInitialStaticSettingsConfig() {
    const logo = 'assets/mfp_mark.svg';

    return {
      header: {
        title: 'OpenMFP Portal',
        logo: logo,
        favicon: logo,
      },
      experimental: {
        btpToolLayout: true,
      },
      btpToolLayout: true,
      responsiveNavigation: 'Fiori3',
      featureToggles: {
        queryStringParam: 'ft',
      },
    };
  }

  getStaticSettingsConfig() {
    return this.getInitialStaticSettingsConfig();
  }
}
