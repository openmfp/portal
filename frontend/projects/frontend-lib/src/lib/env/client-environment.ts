import { AuthData } from '../auth/auth-data';

export interface ClientEnvironment extends AuthEnvironment, EnvironmentBase {
}
export interface EnvironmentBase {
  developmentInstance: boolean;
  qualtricsSiteInterceptUrl: string;
  qualtricsId: string;
  validWebcomponentUrls: string[];
  minimalPluginVersion: number;
  analyticsTrackerEnabled: boolean;
}
export interface AuthEnvironment {
  authData?: AuthData;
  oauthServerUrl: string;
  clientId: string;
}
