export interface AuthData {
  expires_in: string;
  access_token: string;
}

export interface AuthEnvironment {
  authData?: AuthData;
  oauthServerUrl: string;
  tokenUrl: string;
  clientId: string;
}