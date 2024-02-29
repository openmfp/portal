import { DynamicModule, Logger, Module, Type } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EnvService } from './env/env.service';
import { ServiceProviderService } from './service-providers/service-provider.interfaces';
import { ConfigController } from './config/config.controller';
import { LuigiDataService } from './luigi-data/luigi-data.service';
import { EnvController } from './env/env.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LuigiConfigNodesService } from './luigi-config-nodes/luigi-config-nodes.service';
import { AuthCallback, NoopAuthCallback } from './auth/authCallback';
import { LocalTenantProvider, TenantProvider } from './auth/tenantProvider';
import { HeaderParserService } from './request-helper/header-parser.service';
import { bootstrapEnv } from './bootstrapEnv';
import {
  AUTH_CALLBACK_INJECTION_TOKEN,
  ENTITY_CONTEXT_INJECTION_TOKEN,
  FEATURE_TOGGLES_INJECTION_TOKEN,
  PORTAL_CONTEXT_INJECTION_TOKEN,
  FRAME_OPTIONS_INJECTION_TOKEN,
  HEALTH_CHECKER_INJECTION_TOKEN,
  SERVICE_PROVIDER_INJECTION_TOKEN,
  TENANT_PROVIDER_INJECTION_TOKEN,
} from './injectionTokens';
import { AuthController } from './auth/auth.controller';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { PortalContextProvider } from './config/portalContextProvider';
import { EnvFeatureTogglesProvider } from './featureToggles/envFeatureTogglesProvider';
import { EmptyPortalContextProvider } from './config/emptyPortalContextProvider';
import { EmptyServiceProviderService } from './service-providers/EmptyServiceProvider.service';
import { EntityContextProviders } from './config/entityContextProvider';
import { AuthService } from './auth/auth.service';
import { AuthDataService } from './auth/auth-data.service';
import { LogoutController } from './logout/logout.controller';
import { HealthController } from './health/health.controller';
import { EmptyHealthChecker, HealthChecker } from './health/healthChecker';
import { ForwardReference } from '@nestjs/common/interfaces/modules/forward-reference.interface';

export interface PortalModuleOptions {
  /**
   * Development only: If the enviroment is != 'production', this file path will be used
   * to load a .env file into the envrionment. https://www.npmjs.com/package/dotenv is used behin the scenes
   */
  envFilePath?: string;

  authCallbackProvider?: Type<AuthCallback>;

  tenantProvider?: Type<TenantProvider>;
  /**
   * Makes it possible to extend the luigi context of every luigi node with contextValues
   * The values will be available in the context under the property 'portalContext'
   */
  portalContextProvider?: Type<PortalContextProvider>;

  /**
   * Makes it possible to extend the luigi context with values relevant for the respective entity instance.
   * entityContextProviders is map from the entity id to the provider. The provider will be loaded via dependency injection.
   * You can provide a class or a string that can gets resolved to a class. This class must implement the interface EntityContextProvider.
   * The values will be available in the context under the property 'entityContext'
   */
  entityContextProviders?: EntityContextProviders;

  /**
   * A service provider service is responsible for fetching micro-service providers.
   * The micro-frontends need to specify a url.
   */
  serviceProviderService?: Type<ServiceProviderService>;

  /**
   * Providers that need to be known to this module, to create an instance of the other providers, that are added here.
   */
  additionalProviders?: Provider[];

  /**
   * Will be called to determine the heath of the application. If there is a rejected promise, or false is returned, the
   * health is not successful
   */
  healthChecker?: Type<HealthChecker>;

  /**
   * The path to the built sources of the jukebox ui. They will be served statically, so the html site is on the same host.
   * If it is not provided, no sources will be served.
   */
  frontendDistSources?: string;
}

@Module({})
export class PortalModule {
  static create(options: PortalModuleOptions): DynamicModule {
    bootstrapEnv(options);

    const controllers: any[] = [
      AuthController,
      ConfigController,
      EnvController,
      LogoutController,
      HealthController,
    ];

    let providers: Provider[] = [
      {
        provide: FRAME_OPTIONS_INJECTION_TOKEN,
        useValue: options,
      },
      EnvService,
      AuthDataService,
      LuigiDataService,
      LuigiConfigNodesService,
      HeaderParserService,
      NoopAuthCallback,
      LocalTenantProvider,
      EmptyPortalContextProvider,
      EmptyServiceProviderService,
      AuthService,
      Logger,
      {
        provide: AUTH_CALLBACK_INJECTION_TOKEN,
        useClass: options.authCallbackProvider || NoopAuthCallback,
      },
      {
        provide: TENANT_PROVIDER_INJECTION_TOKEN,
        useClass: options.tenantProvider || LocalTenantProvider,
      },
      {
        provide: PORTAL_CONTEXT_INJECTION_TOKEN,
        useClass: options.portalContextProvider || EmptyPortalContextProvider,
      },
      {
        provide: ENTITY_CONTEXT_INJECTION_TOKEN,
        useValue: options.entityContextProviders || {},
      },
      {
        provide: FEATURE_TOGGLES_INJECTION_TOKEN,
        useClass: EnvFeatureTogglesProvider,
      },
      {
        provide: SERVICE_PROVIDER_INJECTION_TOKEN,
        useClass: options.serviceProviderService || EmptyServiceProviderService,
      },
      {
        provide: HEALTH_CHECKER_INJECTION_TOKEN,
        useClass: options.healthChecker || EmptyHealthChecker,
      },
    ];

    if (options.additionalProviders) {
      providers = providers.concat(options.additionalProviders);
    }

    const moduleImports: Array<
      Type | DynamicModule | Promise<DynamicModule> | ForwardReference
    > = [HttpModule.register({})];

    if (options.frontendDistSources) {
      moduleImports.push(
        ServeStaticModule.forRoot({
          rootPath: options.frontendDistSources,
          exclude: ['/rest'],
        })
      );
    }

    return {
      module: PortalModule,
      imports: moduleImports,
      controllers,
      providers,
    };
  }
}
