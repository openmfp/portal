import {
  ServiceProviderResponse,
  ServiceProviderService,
} from './service-provider.interfaces';

export class EmptyServiceProviderService implements ServiceProviderService {
  getServiceProviders(): Promise<ServiceProviderResponse> {
    return Promise.resolve({
      serviceProviders: [],
    });
  }
}
