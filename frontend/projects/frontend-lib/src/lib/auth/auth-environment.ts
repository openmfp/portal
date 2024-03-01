import { AuthData } from './auth-interfaces';

export interface AuthEnvironment {
  authData?: AuthData;
  oauthServerUrl: string;
  clientId: string;
}
