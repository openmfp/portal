import {
  ContentConfiguration,
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
    const entity = !entities || !entities.length ? 'main' : entities[0];
    try {
      const response = await this.k8sApi.listNamespacedCustomObject(
        'core.openmfp.io',
        'v1alpha1',
        'openmfp-system',
        'contentconfigurations',
        null,
        null,
        null,
        null,
        `portal.openmfp.org/entity=${entity}`
      );

      if (!response.body['items']) {
        return {
          rawServiceProviders: [],
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
        rawServiceProviders: [
          {
            name: 'openmfp-system',
            displayName: '',
            creationTimestamp: '',
            contentConfiguration: contentConfigurations,
          },
        ],
      };
    } catch (error) {
      console.error(error);
    }
  }
}
