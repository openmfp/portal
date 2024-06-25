import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
// @ts-ignore
import oAuth2 from '@luigi-project/plugin-auth-oauth2';
import { StorageService } from '../storage.service';
import { LuigiCoreService } from '../luigiCore.service';

@Injectable({
  providedIn: 'root',
})
export class AuthConfigService {
  constructor(private authService: AuthService, private storageService: StorageService, private luigiCoreService: LuigiCoreService) {
  }

  public getAuthConfig(oauthServerUrl: string, clientId: string) {
    return {
      use: 'oAuth2AuthCode',
      storage: 'none',
      oAuth2AuthCode: {
        idpProvider: oAuth2,
        oauthServerUrl,
        logoutUrl: '/rest/logout',
        oAuthData: {
          client_id: clientId,
          scope: 'openid',
          redirect_uri: '/callback',
          response_type: 'code',
        },
        accessTokenExpiringNotificationTime: 60,
        expirationCheckInterval: 5,
        userInfoFn: () => {
          const uinfo = this.authService.getUserInfo();

          return new Promise((resolve) => {
            fetch(uinfo.picture, {
              method: 'HEAD',
              mode: 'no-cors',
            })
              .then(() => {
                resolve(uinfo);
              })
              .catch(() => {
                uinfo.picture = '';
                resolve(uinfo);
              });
          });
        },
      },
      disableAutoLogin: false,
      events: {
        onAuthExpired: () => {
          this.storageService.clearLocalStorage();
          sessionStorage.setItem(
            'dxp.relogin.url',
            window.location.pathname +
            window.location.search +
            window.location.hash,
          );
        },
        onAuthExpireSoon: () => {
          this.luigiCoreService.showAlert({
            text: 'Login session expires soon',
            type: 'warning',
          });
        },
        onLogout: () => {
          this.storageService.clearLocalStorage();
          return true;
        },
      },
    };
  }

}
