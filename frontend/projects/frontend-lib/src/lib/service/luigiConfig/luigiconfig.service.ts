import { Injectable } from '@angular/core';
import { LuigiCoreService } from '../luigiCore.service';
import { AuthConfigService } from './auth.config.service';
import { EnvConfigService } from '../env-config.service';
import { ClientEnvironment } from '../../env/client-environment';

@Injectable({
  providedIn: 'root',
})
export class LuigiconfigService {

  constructor(
    private luigiCoreService: LuigiCoreService,
    private authConfigService: AuthConfigService,
    private envConfigService: EnvConfigService
  ) {

  }


  public async setLuigiConfiguration() {
    const envConfig: ClientEnvironment = await this.envConfigService.getEnvConfig();

    const config = {
      //auth: this.authConfigService.getAuthConfig(envConfig.oauthServerUrl, envConfig.clientId),
      routing: {} as any,
      settings: {
        header: {
          title: 'OpenMFP Portal',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg'
        },
        experimental: {
          btpToolLayout: true
        },
        btpToolLayout: true,
        responsiveNavigation: 'Fiori3'

      },
      navigation: {
        nodes: [{
          pathSegment: 'home',
          label: 'h',
          hideFromNav: true,
          children: [{
              pathSegment: 'overview',
              label: 'Overview',
              icon: 'home',
              viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
              context: {
                  title: 'Welcome to OpenMFP Portal',
                  content: ' '
              }
          },{
            pathSegment: 'gardener',
            label: 'Gardener Dashboard',
            viewUrl: 'https://d.ing.gardener-op.mfp-dev.shoot.canary.k8s-hana.ondemand.com/',
            icon: 'https://d.ing.gardener-op.mfp-dev.shoot.canary.k8s-hana.ondemand.com/static/assets/logo.svg',
            loadingIndicator: {
              enabled: false
            }
          },{
              pathSegment: 'empty',
              label: 'Empty Page',
              category: {
                  label: 'Fundamental Demo Pages',
                  icon: 'dimension',
                  collapsible: true
              },
              loadingIndicator: {
                  enabled: false
              },
              viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/fundamental/empty-demo-page.html'
          },{
              pathSegment: 'table',
              label: 'Table',
              category: 'Fundamental Demo Pages',
              loadingIndicator: {
                  enabled: false
              },
              viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/fundamental/table-demo-page.html'
          },{
              pathSegment: 'tree',
              label: 'Tree',
              category: 'Fundamental Demo Pages',
              loadingIndicator: {
                  enabled: false
              },
              viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/fundamental/tree-demo-page.html'
          }]
        }]
      }
    };
    config.routing.pageNotFoundHandler = () => {
      // NO OP, needs to be disabled for initial config
    };
    // routing needs to be disabled for initial config
    // config.routing.skipRoutingForUrlPatterns = [/.*/];
    // modal handling needs to be disabled for initial config
    config.routing.showModalPathInUrl = false;
    config.routing.modalPathParam = 'modalPathParamDisabled'; // workaround, this line can be removed after luigi checks showModalPathInUrl initially (https://github.com/SAP/luigi/issues/2291)

    this.luigiCoreService.setConfig(config);
  }
}
