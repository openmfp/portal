import { Injectable } from '@angular/core';
import { LuigiCoreService } from '../luigiCore.service';

@Injectable({
  providedIn: 'root',
})
export class LuigiconfigService {

  constructor(
    private luigiCoreService: LuigiCoreService,
  ) {
    
  }


  public async setLuigiConfiguration() {
    const config = {
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
