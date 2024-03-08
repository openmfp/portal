import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RequestHeadersService } from './requestHeaders.service';
import { EntityConfig, PortalConfig } from '../../../../../../../backend/libs/portal-lib/src/luigiNode';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private portalConfigCache: Promise<PortalConfig> | undefined;

  private entityConfigCache: Record<
    string /* entity */,
    Record<string /* ctx */, Promise<EntityConfig>>
  > = {};

  constructor(
    private http: HttpClient,
    private requestHeadersService: RequestHeadersService
  ) {}

  async getPortalConfig(): Promise<PortalConfig> {
    if (this.portalConfigCache) {
      return this.portalConfigCache;
    }

    // cache response, since it gets called multiple times due to Luigi internals
    const options = this.requestHeadersService.createOptionsWithAuthHeader();
    // @ts-ignore
    const response : Promise<PortalConfig> = this.http
      .get<PortalConfig>('/rest/config', options)
      .toPromise()
      .catch((e) => {
        if (e instanceof HttpErrorResponse && e.status === 403) {
          window.location.assign('/logout?error=invalidToken');
        }
        throw e;
      });
    this.portalConfigCache = response as Promise<PortalConfig> | undefined;

    return response;
  }

  async getEntityConfig(
    entity: string,
    context?: Record<string, string>
  ): Promise<EntityConfig> {
    const entityCacheKey = JSON.stringify(context);
    if (
      this.entityConfigCache[entity] &&
      !!this.entityConfigCache[entity][entityCacheKey]
    ) {
      return this.entityConfigCache[entity][entityCacheKey];
    }

    const options = this.requestHeadersService.createOptionsWithAuthHeader();
    const response = this.http
      .get<EntityConfig>(`/rest/config/${entity}`, {
        ...options,
        ...{ params: context },
      })
      .toPromise();

    const entityConfig = response as Promise<EntityConfig>;

    if (!this.entityConfigCache[entity]) {
      this.entityConfigCache[entity] = {};
    }
    // @ts-ignore
    this.entityConfigCache[entity][entityCacheKey] = entityConfig;
    return entityConfig;
  }

  clearEntityConfigCache(): void {
    this.entityConfigCache = {};
  }
}
