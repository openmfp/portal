export interface ClientEnvironment extends AuthEnvironment, EnvironmentBase {}
export interface EnvironmentBase {
    developmentInstance: boolean;
}
export interface AuthEnvironment {
    authData?: AuthData;
    oauthServerUrl: string;
    clientId: string;
}
export interface AuthData {
    expires_in: string;
    access_token: string;
}
