import { Test, TestingModule } from '@nestjs/testing';
import { LuigiConfigNodesService } from './luigi-config-nodes.service';
import { PortalModule } from '../portal-lib.module';
import {
  RawServiceProvider,
  ServiceProviderService,
} from '../service-providers/service-provider.interfaces';
import { LuigiDataService } from '../luigi-data/luigi-data.service';
import { mock } from 'jest-mock-extended';
import { SERVICE_PROVIDER_INJECTION_TOKEN } from '../injectionTokens';
import { LuigiNode } from '../luigiNode';

describe('LuigiConfigNodesService', () => {
  let service: LuigiConfigNodesService;
  let serviceProviderService: ServiceProviderService;
  let luigiDataService: LuigiDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PortalModule.create({})],
    })
      .overrideProvider(SERVICE_PROVIDER_INJECTION_TOKEN)
      .useValue(mock<ServiceProviderService>())
      .compile();

    service = module.get<LuigiConfigNodesService>(LuigiConfigNodesService);
    serviceProviderService = module.get<ServiceProviderService>(
      SERVICE_PROVIDER_INJECTION_TOKEN
    );
    luigiDataService = module.get<LuigiDataService>(LuigiDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a service provider for each request', async () => {
    const nodes: LuigiNode[] = [];
    jest
      .spyOn(luigiDataService, 'getLuigiDataFromFragment')
      .mockReturnValue(Promise.resolve(nodes));
    const rawServiceProviders: RawServiceProvider[] = [
      {
        name: 'a',
        luigiConfigFragment: [{ data: {}}],
        config: {},
        creationTimestamp: '2022-05-17T11:37:17Z',
      },
      {
        name: 'b',
        luigiConfigFragment: [{ data: {}}],
        config: {},
        creationTimestamp: '2021-05-17T11:37:17Z',
      },
    ];
    const token = 'token';
    const getExtensionClassesMock = jest
      .spyOn(serviceProviderService, 'getServiceProviders')
      .mockResolvedValue({
        serviceProviders: rawServiceProviders,
      });

    // Act
    const serviceProvidersForTenant = await service.getNodes(
      token,
      ['TENANT'],
      'en',
      {
        key: 'val',
      }
    );

    // Assert
    expect(serviceProvidersForTenant.length).toBe(2);
    expect(serviceProvidersForTenant[0].creationTimestamp).toBe(
      '2022-05-17T11:37:17Z'
    );
    expect(getExtensionClassesMock).toHaveBeenCalledWith(token, ['TENANT'], {
      key: 'val',
    });

    getExtensionClassesMock.mockClear();

    // Act 2
    const serviceProvidersForProject = await service.getNodes(
      token,
      ['PROJECT'],
      'en',
      { key: 'val' }
    );

    // Assert 2
    expect(serviceProvidersForProject.length).toBe(2);
    expect(getExtensionClassesMock).toHaveBeenCalledWith(token, ['PROJECT'], {
      key: 'val',
    });
  });
});
