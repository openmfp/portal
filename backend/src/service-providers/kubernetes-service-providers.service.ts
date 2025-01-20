import {
  ContentConfiguration,
  RawServiceProvider,
  ServiceProviderResponse,
  ServiceProviderService,
} from '@openmfp/portal-server-lib';
import * as k8s from '@kubernetes/client-node';
import { CustomObjectsApi } from '@kubernetes/client-node';

export class KubernetesServiceProvidersService
  implements ServiceProviderService
{
  private k8sApi: CustomObjectsApi;

  constructor() {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
  }

  async getServiceProviders(
    token: string,
    entities: string[],
    context: Record<string, any>
  ): Promise<ServiceProviderResponse> {
    try {
      const response = await this.k8sApi.listNamespacedCustomObject(
        'core.openmfp.io',
        'v1alpha1',
        'openmfp-system',
        'contentconfigurations'
      );

      if (!response.body['items']) {
        return {
          serviceProviders: [],
        };
      }

      const responseItems = response.body['items'] as any[];

      let contentConfigurations = responseItems
        .filter((item) => !!item.status.configurationResult)
        .map((item) => {
          const contentConfiguration = JSON.parse(
            item.status.configurationResult
          ) as ContentConfiguration;
          contentConfiguration.url = item.status.url;
          return contentConfiguration;
        });

      return {
        serviceProviders: [
          {
            contentConfiguration: contentConfigurations,
          } as RawServiceProvider,
        ],
      };
    } catch (error) {
      console.error(error);
    }
  }
}
