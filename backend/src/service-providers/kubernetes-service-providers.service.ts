import {
  ContentConfiguration,
  ServiceProviderResponse,
  ServiceProviderService,
} from '@openmfp/portal-server-lib';
import { KubeConfig, CustomObjectsApi } from '@kubernetes/client-node';

export class KubernetesServiceProvidersService
  implements ServiceProviderService
{
  private k8sApi: CustomObjectsApi;

  constructor() {
    const kc = new KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(CustomObjectsApi);
  }

  async getServiceProviders(
    token: string,
    entities: string[],
    context: Record<string, any>
  ): Promise<ServiceProviderResponse> {
    const entity = !entities || !entities.length ? 'main' : entities[0];

    try {
      const response = await this.k8sApi.listNamespacedCustomObject({
        group: 'core.openmfp.io',
        version: 'v1alpha1',
        namespace: 'openmfp-system',
        plural: 'contentconfigurations',
        labelSelector: `portal.openmfp.org/entity=${entity}`,
      });

      if (!response.items) {
        return {
          rawServiceProviders: [],
        };
      }

      const responseItems = response.items as any[];

      let contentConfigurations = responseItems
        .filter((item) => !!item.status.configurationResult)
        .map((item) => {
          const contentConfiguration = JSON.parse(
            item.status.configurationResult
          ) as ContentConfiguration;
          contentConfiguration.url = item.spec.remoteConfiguration.url;
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
