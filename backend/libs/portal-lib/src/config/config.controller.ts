import {
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Req,
  Res,
  NotFoundException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { LuigiConfigNodesService } from '../luigi-config-nodes/luigi-config-nodes.service';
import { Request, Response } from 'express';
import { HeaderParserService } from '../request-helper/header-parser.service';
import {
  ENTITY_CONTEXT_INJECTION_TOKEN,
  FEATURE_TOGGLES_INJECTION_TOKEN,
  PORTAL_CONTEXT_INJECTION_TOKEN,
  TENANT_PROVIDER_INJECTION_TOKEN,
} from '../injectionTokens';
import { TenantProvider } from '../auth/tenantProvider';
import { PortalContextProvider } from './portalContextProvider';
import { EntityParams } from './dto/entity';
import { PortalConfig, ServiceProvider } from '../luigiNode';
import { FeatureTogglesProvider } from '../featureToggles/featureTogglesProvider';
import {
  EntityContextProvider,
  EntityContextProviders,
  EntityNotFoundException,
} from './entityContextProvider';
import { ModuleRef } from '@nestjs/core';

@Controller('/rest/config')
export class ConfigController {
  private entityContextProviders: Record<string, EntityContextProvider> = {};

  constructor(
    private luigiConfigNodes: LuigiConfigNodesService,
    private headerParser: HeaderParserService,
    @Inject(TENANT_PROVIDER_INJECTION_TOKEN)
    private tenantProvider: TenantProvider,
    @Inject(PORTAL_CONTEXT_INJECTION_TOKEN)
    private frameContextProvider: PortalContextProvider,
    @Inject(ENTITY_CONTEXT_INJECTION_TOKEN)
    entityContextProviders: EntityContextProviders,
    @Inject(FEATURE_TOGGLES_INJECTION_TOKEN)
    private featureTogglesProvider: FeatureTogglesProvider,
    moduleRef: ModuleRef
  ) {
    for (const [entity, eCP] of Object.entries(entityContextProviders)) {
      this.entityContextProviders[entity] = moduleRef.get(eCP);
    }
  }

  @Get()
  async getConfig(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Headers('Accept-language') acceptLanguage: string
  ): Promise<PortalConfig> {
    // start async processes
    const providersAndTenantPromise = this.getProvidersAndTenant(
      request,
      acceptLanguage
    ).catch((e: Error) => e);
    const featureTogglePromise = this.featureTogglesProvider
      .getFeatureToggles()
      .catch((e: Error) => e);
    const frameContextPromise = this.frameContextProvider
      .getContextValues(request, response)
      .catch((e: Error) => e);

    try {
      // TODO: follow-up to get rid of this try/catch block: https://github.tools.sap/dxp/jukebox/issues/1041

      // await all promises
      const featureToggles = ConfigController.getOrThrow(
        await featureTogglePromise
      );
      const frameContext = ConfigController.getOrThrow(
        await frameContextPromise
      );
      const { tenantId, providers } = ConfigController.getOrThrow(
        await providersAndTenantPromise
      );

      frameContext.extensionManagerMissingMandatoryDataUrl =
        this.getExtensionManagerMissingMandatoryDataUrl(providers);

      return {
        providers,
        tenantId,
        frameContext,
        featureToggles,
      };
    } catch (e) {
      if (e instanceof ForbiddenException) {
        response.status(HttpStatus.FORBIDDEN);
        return undefined;
      }
      throw e;
    }
  }

  // Jukebox UI needs this URL to show a Page from Extension Manager UI
  private getExtensionManagerMissingMandatoryDataUrl(
    providers: ServiceProvider[]
  ): string | undefined {
    const node = providers
      .map((provider) => provider.nodes)
      .flat()
      .find((node) => node.context?.providesMissingMandatoryDataUrl);
    return node?.viewUrl;
  }

  private async getProvidersAndTenant(
    request: Request,
    acceptLanguage: string
  ) {
    const token = this.headerParser.extractBearerToken(request);
    const tenantId = await this.tenantProvider.provideTenant(request);

    const providers = await this.luigiConfigNodes.getNodes(
      token,
      ['GLOBAL', 'TENANT'],
      acceptLanguage,
      { tenant: tenantId }
    );
    return { tenantId, providers };
  }

  @Get(':entity')
  async getEntityConfig(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param() params: EntityParams,
    @Headers('Accept-language') acceptLanguage: string
  ) {
    const token = this.headerParser.extractBearerToken(request);

    const providersPromise = this.luigiConfigNodes
      .getNodes(token, [params.entity], acceptLanguage, request.query)
      .catch((e: Error) => e);

    const eCP = this.entityContextProviders[params.entity];
    const entityContextPromise = eCP
      ? eCP.getContextValues(token, request.query).catch((e: Error) => e)
      : Promise.resolve({});

    try {
      // TODO: follow-up to get rid of this try/catch block: https://github.tools.sap/dxp/jukebox/issues/1041
      return {
        providers: ConfigController.getOrThrow(await providersPromise),
        entityContext: ConfigController.getOrThrow(await entityContextPromise),
      };
    } catch (e) {
      if (e instanceof NotFoundException) {
        response.status(404);
        return undefined;
      }
      throw e;
    }
  }

  static getOrThrow<T>(v: T | Error): T {
    if (v instanceof Error) {
      if (v instanceof EntityNotFoundException) {
        throw new NotFoundException();
      }
      throw v;
    }
    return v;
  }
}
