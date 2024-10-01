import { StaticSettingsConfigService } from '@openmfp/portal-ui-lib';

export class ApeiroraStaticSettingsConfigService
  implements StaticSettingsConfigService
{
  getInitialStaticSettingsConfig() {
    const specialTenant =
      (window.location.origin.indexOf('cloudfabrik') >= 0 && 'cloud') ||
      (window.location.origin.indexOf('econuagetech') >= 0 && 'nuage') ||
      undefined;

    const logo = 'assets/apeirora-mark.svg';
    const settings: any = {
      header: {
        title: 'ApeiroRA Portal',
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
      appLoadingIndicator: {
        hideAutomatically: true,
      },
    };

    if (specialTenant) {
      const theme =
        specialTenant === 'cloud' ? 'sap_horizon_dark' : 'sap_horizon';
      const style = document.createElement('link');
      style.setAttribute('rel', 'stylesheet'),
        style.setAttribute(
          'href',
          'https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content/content/Base/baseLib/' +
            theme +
            '/css_variables.css'
        );
      document.head.append(style);
      const style2 = document.createElement('link');
      style2.setAttribute('rel', 'stylesheet'),
        style2.setAttribute(
          'href',
          'https://cdn.jsdelivr.net/npm/fundamental-styles@0.37.4/dist/theming/' +
            theme +
            '.css'
        );
      document.head.append(style2);

      // @ts-ignore
      settings.theming.defaultTheme = theme;
      settings.header.title =
        specialTenant === 'cloud' ? 'CloudFabrik' : 'ÉcoNuageTech';
      settings.header.logo =
        specialTenant === 'cloud'
          ? './assets/cloudfabrik.svg'
          : './assets/econuage.svg';
      settings.header.favicon = settings.header.logo;
    }

    return settings;
  }

  getStaticSettingsConfig() {
    return this.getInitialStaticSettingsConfig();
  }
}
