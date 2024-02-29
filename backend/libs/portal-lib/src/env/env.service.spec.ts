import { Test, TestingModule } from '@nestjs/testing';
import { EnvService } from './env.service';
import { FRAME_OPTIONS_INJECTION_TOKEN } from '../injectionTokens';
import { mock } from 'jest-mock-extended';
import { PortalModuleOptions } from '../portal-lib.module';
import { Request } from 'express';

describe('EnvService', () => {
  let service: EnvService;

  beforeEach(async () => {
    const frameModuleOptions = mock<PortalModuleOptions>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvService,
        {
          provide: FRAME_OPTIONS_INJECTION_TOKEN,
          useValue: frameModuleOptions,
        },
      ],
    }).compile();

    service = module.get<EnvService>(EnvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  [
    {
      envVarName: 'TENANT_ID',
      resultName: 'tenantId',
      value: 'someId',
      expected: 'someId',
    },
    {
      envVarName: 'QUALTRICS_ID',
      resultName: 'qualtricsId',
      value: 'someQualtricsId',
      expected: 'someQualtricsId',
    },
    {
      envVarName: 'EXTENSION_MANAGER_SERVICE_API_URL',
      resultName: 'extensionManagerApiUrl',
      value: 'someapi',
      expected: 'someapi',
    },
    {
      envVarName: 'HEALTH_CHECK_INTERVAL',
      resultName: 'healthCheckInterval',
      value: '123',
      expected: 123,
    },
    {
      envVarName: 'HEALTH_CHECK_INTERVAL',
      resultName: 'healthCheckInterval',
      value: '',
      expected: NaN,
    },
    {
      envVarName: 'HEALTH_CHECK_INTERVAL',
      resultName: 'healthCheckInterval',
      value: 'aaaa',
      expected: NaN,
    },
  ].forEach(function ({ envVarName, resultName, value, expected }) {
    it('should get ' + resultName, () => {
      process.env[envVarName] = value;

      expect(service.getEnv()[resultName]).toBe(expected);

      process.env[envVarName] = undefined;
    });
  });

  it('should get if its a development instance', () => {
    process.env['DEVELOPMENT_INSTANCE'] = 'true';

    expect(service.getEnv().developmentInstance).toBe(true);

    process.env['DEVELOPMENT_INSTANCE'] = undefined;
  });

  it('should the idp names', () => {
    process.env['IDP_NAMES'] = 'a,b.c,d';

    expect(service.getEnv().idpNames).toEqual(['a', 'b.c', 'd']);

    process.env['IDP_NAMES'] = undefined;
  });


  describe('getEnvWithAuth', () => {
    const oauthServerUrlExample = 'www.example.com';
    const oauthServerUrlFoo = 'www.foo.com';
    const oauthServerUrlBar = 'www.bar.com';
    const clientIdFoo = '12134aads';
    const clientIdBar = 'bbbtttppp';
    const clientIdBaz = 'asqrfr';
    const clientSecretHyperspace = 'topSecret';
    const clientSecretFoo = 'topSecretFoo';
    const clientSecretSap = 'topSecretSap';

    beforeEach(() => {
      process.env['IDP_NAMES'] = 'bar,foo,not-configured';
      process.env['BASE_DOMAINS_SAP'] = 'foo.example.com';
      process.env['IAS_TENANT_URL_SAP'] = oauthServerUrlExample;
      process.env['OIDC_CLIENT_ID_SAP'] = clientIdBaz;
      process.env['OIDC_CLIENT_SECRET_SAP'] = clientSecretSap;
      process.env['BASE_DOMAINS_FOO'] = '';
      process.env['IAS_TENANT_URL_FOO'] = oauthServerUrlFoo;
      process.env['OIDC_CLIENT_ID_FOO'] = clientIdFoo;
      process.env['OIDC_CLIENT_SECRET_FOO'] = clientSecretFoo;
      process.env['IAS_TENANT_URL_HYPERSPACE'] = oauthServerUrlBar;
      process.env['OIDC_CLIENT_ID_HYPERSPACE'] = clientIdBar;
      process.env['OIDC_CLIENT_SECRET_HYPERSPACE'] = clientSecretHyperspace;
    });

    it('should map the idp to the url for foo', () => {
      const request = mock<Request>();
      request.hostname = 'foo.space';

      const envWithAuth = service.getCurrentAuthEnv(request);

      expect(envWithAuth.clientId).toBe(clientIdFoo);
      expect(envWithAuth.oauthServerUrl).toBe(oauthServerUrlFoo);
      expect(envWithAuth.oauthServerUrl).toBe(oauthServerUrlFoo);
    });

    it('should map the idp of foo to a different base url', () => {
      const request = mock<Request>();
      request.hostname = 'foo.dxp.k8s.ondemand.com';

      const envWithAuth = service.getCurrentAuthEnv(request);

      expect(envWithAuth.clientId).toBe(clientIdFoo);
      expect(envWithAuth.oauthServerUrl).toBe(oauthServerUrlFoo);
      expect(envWithAuth.clientSecret).toBe(clientSecretFoo);
    });

    it('should return the default tenant, if a host name is directly matched', () => {
      const request = mock<Request>();
      request.hostname = 'dxp.k8s.ondemand.com';

      const envWithAuth = service.getCurrentAuthEnv(request);

      expect(envWithAuth.clientId).toBe(clientIdBaz);
      expect(envWithAuth.oauthServerUrl).toBe(oauthServerUrlExample);
      expect(envWithAuth.clientSecret).toBe(clientSecretSap);
    });

    it('should return the default tenant, for a different host with multiple names is directly matched', () => {
      const request = mock<Request>();
      request.hostname = 'some.host';

      const envWithAuth = service.getCurrentAuthEnv(request);

      expect(envWithAuth.clientId).toBe(clientIdBar);
      expect(envWithAuth.oauthServerUrl).toBe(oauthServerUrlBar);
      expect(envWithAuth.clientSecret).toBe(clientSecretHyperspace);
    });

    it('should throw when the idp is not existing', () => {
      const request = mock<Request>();
      request.hostname = 'not-existing.dxp.k8s.ondemand.com';

      expect(function () {
        service.getCurrentAuthEnv(request);
      }).toThrow("the idp 'not-existing' is not configured!");
    });

    it('should throw when the domain is not existing', () => {
      const request = mock<Request>();
      request.hostname = 'bar.foo.com';

      expect(function () {
        service.getCurrentAuthEnv(request);
      }).toThrow(
        "bar.foo.com is not listed in the frame's base urls: 'another.domain.com,some.domain,localhost'"
      );
    });

    it('should throw when the idp is not properly configured', () => {
      const request = mock<Request>();
      request.hostname = 'not-configured.dxp.k8s.ondemand.com';

      expect(function () {
        service.getCurrentAuthEnv(request);
      }).toThrow(
        "the idp not-configured is not properly configured. oauthServerUrl: 'undefined' clientId: 'undefined', has client secret (OIDC_CLIENT_SECRET_NOT_CONFIGURED): false"
      );
    });
  });

  describe('getFeatureToggles', function () {
    [
      {
        featureString: '',
        expectedObject: {},
      },
      {
        featureString: 'a=true',
        expectedObject: {
          a: true,
        },
      },
      {
        featureString: 'b=foo,a=TrUe',
        expectedObject: {
          a: true,
          b: false,
        },
      },
      {
        featureString: 'b = foo, a=TrUe ',
        expectedObject: {
          a: true,
          b: false,
        },
      },
    ].forEach((testCase) => {
      it(`should parse features fo '${testCase.featureString}'`, () => {
        process.env.FEATURE_TOGGLES = testCase.featureString;
        const features = service.getFeatureToggles();
        expect(features).toEqual(testCase.expectedObject);
      });
    });
  });
});
