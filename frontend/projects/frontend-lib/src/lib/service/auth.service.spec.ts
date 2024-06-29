import { AuthService } from './auth.service';
import sign from 'jwt-encode';

describe('AuthService', () => {
  let service: AuthService;
  const testTokenContent = {
    first_name: 'Max',
    last_name: 'Mustermann',
    mail: 'max.mustermann@sap.com',
    sub: 'D999999',
  };
  const testToken = asJwtToken(testTokenContent);

  beforeEach(() => {
    service = new AuthService();
    service.setAuthData({
      access_token: testToken,
      expires_in: '1213123',
      id_token: testToken,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('should set github token', () => {
    it('should return undefined if the domain is not set', () => {
      expect(service.getGithubAuthDataForDomain('foo')).toEqual(undefined);
    });

    it('should set the github token for github domain', () => {
      const authDataTools = { access_token: 'bar' };
      const authDataCom = { access_token: 'baz' };
      service.setGithubauthDataForDomain('github.tools.sap', authDataTools);
      service.setGithubauthDataForDomain('github.tools.com', authDataCom);

      expect(service.getGithubAuthDataForDomain('github.tools.sap')).toEqual(
        authDataTools
      );
      expect(service.getGithubAuthDataForDomain('github.tools.com')).toEqual(
        authDataCom
      );
    });

    it('should set the github token', () => {
      const authData = {
        'github.tools.sap': { access_token: 'bar' },
        'github.tools.com': { access_token: 'baz' },
      };
      service.setGithubauthData(authData);

      expect(service.getGithubAuthDataForDomain('github.tools.sap')).toEqual({
        access_token: 'bar',
      });
      expect(service.getGithubAuthDataForDomain('github.tools.com')).toEqual({
        access_token: 'baz',
      });
    });
  });

  describe('should return data from access token', () => {
    it('should return token', () => {
      expect(service.getToken()).toEqual(testToken);
    });

    it('should calculate user info', () => {
      expect(service.getUserInfo()).toEqual({
        name: 'Max Mustermann',
        email: 'max.mustermann@sap.com',
        description: 'max.mustermann@sap.com',
        picture: `https://avatars.wdf.sap.corp/avatar/D999999`,
        icon: false,
        initials: 'MM',
      });
    });

    it('should return user', () => {
      expect(service.getUser()).toEqual({
        first_name: 'Max',
        last_name: 'Mustermann',
        mail: 'max.mustermann@sap.com',
        sub: 'D999999',
      });
    });

    it('should return user name', () => {
      expect(service.getUsername()).toEqual('D999999');
    });

    it('should return user email', () => {
      expect(service.getUserEmail()).toEqual('max.mustermann@sap.com');
    });
  });

  function asJwtToken(token: any): string {
    return sign(token, 'key');
  }
});
