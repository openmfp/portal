import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { FrameModule } from '../frame.module';
import { HeaderParserService } from './header-parser.service';
import { Request } from 'express';
import { KubeConfigProvider } from '../k8s/kubeconfig-provider';
import { KubeConfig } from '@kubernetes/client-node';

describe('HeaderParserService', () => {
  let service: HeaderParserService;
  let requestMock: Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FrameModule.create({})],
    })
      .overrideProvider(KubeConfigProvider)
      .useValue({
        getKubeConfig: function () {
          return mock<KubeConfig>();
        },
      })
      .compile();
    service = module.get<HeaderParserService>(HeaderParserService);

    requestMock = mock<Request>();
  });

  it('should extract the token', () => {
    const token = 'fosdoasd';
    requestMock.headers.authorization = 'Bearer ' + token;
    const tenantId = service.extractBearerToken(requestMock);
    expect(tenantId).toBe(token);
  });
});
