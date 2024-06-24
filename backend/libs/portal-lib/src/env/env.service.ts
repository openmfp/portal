import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import {AuthEnvironment, EnvironmentBase} from "./clientEnvironment";


export interface EnvVariables extends EnvironmentBase, ServerEnv {}

interface ServerEnv {
  isLocal: boolean;
  releaseNamespace: string;
  extensionManagerApiUrl: string;
  tenantId: string;
  idpNames: string[];
  frontendPort: string;
  healthCheckInterval?: number;
}

export interface ServerAuthEnvironment extends AuthEnvironment {
  clientSecret: string;
}

interface baseDomainsToIdp {
  idpName: string;
  baseDomain: string;
}

@Injectable()
export class EnvService {
  public getEnv(): EnvVariables {
    return {
      idpNames: this.getIdpNames(),
      extensionManagerApiUrl: process.env.EXTENSION_MANAGER_SERVICE_API_URL,
      isLocal: process.env.ENVIRONMENT === 'local',
      releaseNamespace: process.env.RELEASE_NAMESPACE,
      developmentInstance: process.env.DEVELOPMENT_INSTANCE === 'true',
      tenantId: process.env.TENANT_ID,
      frontendPort: process.env.FRONTEND_PORT,
      healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL, 10),
    };
  }

  getIdpNames(): Array<string> {
    const idpNames = process.env.IDP_NAMES || '';
    return idpNames.split(',');
  }

  public getFeatureToggles(): Record<string, boolean> {
    const featureToggleString = process.env.FEATURE_TOGGLES || '';
    const features = featureToggleString.split(',').filter(Boolean);
    const result = {};

    for (const feature of features) {
      const nameAndValue = feature.split('=');
      const name = nameAndValue[0].trim();
      result[name] = nameAndValue[1].toLowerCase().trim() === 'true';
    }

    return result;
  }

  private getAuthEnv(idpName: string): ServerAuthEnvironment {
    const env = this.getEnv();

    if (!env.idpNames.includes(idpName)) {
      throw new Error(`the idp '${idpName}' is not configured!`);
    }

    const idpEnvName = this.getIdpEnvName(idpName);
    const oauthServerUrl = process.env[`AUTH_SERVER_URL_${idpEnvName}`];
    const tokenUrl = process.env[`TOKEN_URL_${idpEnvName}`];
    const clientId = process.env[`OIDC_CLIENT_ID_${idpEnvName}`];
    const clientSecretEnvVar = `OIDC_CLIENT_SECRET_${idpEnvName}`;
    const clientSecret = process.env[clientSecretEnvVar];

    if (!oauthServerUrl || !tokenUrl || !clientId || !clientSecret) {
      const hasClientSecret = !!clientSecret;
      throw new Error(
        `the idp ${idpName} is not properly configured. oauthServerUrl: '${oauthServerUrl}' tokenUrl '${tokenUrl}' clientId: '${clientId}', has client secret (${clientSecretEnvVar}): ${String(
          hasClientSecret
        )}`
      );
    }

    return {
      ...env,
      oauthServerUrl: oauthServerUrl,
      tokenUrl: tokenUrl,
      clientId: clientId,
      clientSecret: clientSecret,
    };
  }

  private getIdpEnvName(idpName: string) {
    return idpName.toUpperCase().replace('-', '_');
  }

  private getBaseDomainRegex(baseDomain: string): RegExp {
    return new RegExp(`(.*)\\.${baseDomain}`);
  }

  private getBaseDomainsToIdp(): baseDomainsToIdp[] {
    let baseDomains: baseDomainsToIdp[] = [];

    for (const idpName of this.getIdpNames()) {
      const idpEnvName = this.getIdpEnvName(idpName);
      const idpDomains = process.env[`BASE_DOMAINS_${idpEnvName}`] || '';
      const idpNames = idpDomains.split(',');
      baseDomains = baseDomains.concat(
        idpNames.filter(Boolean).map((baseDomain) => {
          return {
            idpName,
            baseDomain,
          };
        })
      );
    }

    return baseDomains;
  }
  public getCurrentAuthEnv(request: Request): ServerAuthEnvironment {
    const baseDomainsToIdps = this.getBaseDomainsToIdp();
    const defaultTenant = baseDomainsToIdps.find(
      (x) => x.baseDomain === request.hostname
    );
    if (defaultTenant) {
      return this.getAuthEnv(defaultTenant.idpName);
    }

    for (const baseDomainToIdp of baseDomainsToIdps) {
      const r = this.getBaseDomainRegex(baseDomainToIdp.baseDomain);
      const regExpExecArray = r.exec(request.hostname);
      if (!regExpExecArray) {
        continue;
      }

      if (regExpExecArray.length > 1) {
        return this.getAuthEnv(regExpExecArray[1]);
      }
    }

    throw new Error(
      `${
        request.hostname
      } is not listed in the frame's base urls: '${baseDomainsToIdps
        .map((x) => x.baseDomain)
        .join(',')}'`
    );
  }
}
