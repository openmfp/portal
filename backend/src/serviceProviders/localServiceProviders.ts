import { readFile } from 'fs/promises';
import { RawServiceProvider, ServiceProviderResponse, ServiceProviderService } from '@openmfp/portal-lib';
import { join } from 'path';

export class LocalServiceProviderService implements ServiceProviderService {
  async getServiceProviders(token: string, entities: string[], context: Record<string, any>): Promise<ServiceProviderResponse> {
    let s1 = await this.createServiceProviderFromJson( 'home.json');
    let s2 = await this.createServiceProviderFromJson('gardener.json');
    let s3 = await this.createServiceProviderFromJson('service-provider3.json');

    return Promise.resolve({
      serviceProviders: [s1, s2, s3],
    });
  }

  private async createServiceProviderFromJson(path: string): Promise<RawServiceProvider> {
    const fileContent = await readFile(join(__dirname, "provider-jsons",path), 'utf-8');
    return JSON.parse(fileContent);
  }
}