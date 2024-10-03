import { RawServiceProvider } from '@openmfp/portal-server-lib/dist/config/context/service-provider';
import { readFile } from 'fs/promises';
import {
  ServiceProviderResponse,
  ServiceProviderService,
} from '@openmfp/portal-server-lib';
import { join } from 'path';
import { s1, s2, s3 } from './provider-jsons/service-providers';

export class LocalServiceProviderService implements ServiceProviderService {
  async getServiceProviders(
    token: string,
    entities: string[],
    context: Record<string, any>
  ): Promise<ServiceProviderResponse> {
    const p: ServiceProviderResponse = {
      serviceProviders: [
        {
          contentConfiguration: [s1],
          name: 'First Step',
          displayName: 'First Step',
          config: {},
          creationTimestamp: '2022-05-17T11:37:17Z',
        },
        {
          contentConfiguration: [s2],
          name: 'Second Step',
          displayName: 'Second Step',
          config: {},
          creationTimestamp: '2022-05-17T11:37:17Z',
        },
        {
          contentConfiguration: [s3],
          name: 'Third Step',
          displayName: 'Third Step',
          config: {},
          creationTimestamp: '2022-05-17T11:37:17Z',
        },
      ],
    };
    return Promise.resolve(p);
  }

  private async createServiceProviderFromJson(
    path: string
  ): Promise<RawServiceProvider> {
    const fileContent = await readFile(
      join(__dirname, '../src/service-providers/provider-jsons', path),
      'utf-8'
    );
    return JSON.parse(fileContent);
  }
}
