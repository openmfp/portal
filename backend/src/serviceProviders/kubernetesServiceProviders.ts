import {
  RawServiceProvider,
  ServiceProviderResponse,
  ServiceProviderService,
} from '@openmfp/portal-server-lib';
import * as k8s from '@kubernetes/client-node';
import { CustomObjectsApi } from '@kubernetes/client-node';

export class KubernetesServiceProviders implements ServiceProviderService {
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

      let serviceProviders = responseItems.map(
        (x) => JSON.parse(x.status.configurationResult) as RawServiceProvider
      );

      return {
        serviceProviders: serviceProviders,
      };
    } catch (error) {
      console.error(error);
    }
  }
}
