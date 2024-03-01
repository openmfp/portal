import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LuigiCoreService } from '../service/luigiCore.service';
import { AuthService } from '../service/auth.service';
// @ts-ignore
import * as url from 'url';
import { HttpClient } from '@angular/common/http';
import { AuthData } from '../auth/auth-data';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-callback',
  template: '',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class CallbackComponent {

  private code: string;
  private state: string;

  constructor(
    private route: ActivatedRoute,
    private luigiCoreService: LuigiCoreService,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.code = ""
    this.state = ""
    this.route.queryParams.subscribe((queryParams) => {
      this.code = queryParams.code;
      this.state = queryParams.state;
      return this.processAuthData();
    });
  }

  login() {
    return this.router.navigate(['/']);
  }

  async displayLoginError() {
    await this.router.navigate(['/logout'], {
      queryParams: { error: 'loginError' },
    });
  }

  private async processAuthData() {
    try {
      const appStateUrl = this.createAppStateUrl();

      if (!this.code || !this.stateOriginMatchesOrigin(appStateUrl)) {
        return this.displayLoginError();
      }

      const response: AuthData = await lastValueFrom(
        this.http.post<AuthData>(
          `/rest/auth?code=${this.code}&state=${this.state}`,
          {}
        )
      );

      this.authService.setAuthData(response);

      return this.router.navigate(
        [appStateUrl.pathname],
        this.createNavigationParams(appStateUrl)
      );
    } catch (e) {
      return this.displayLoginError();
    }
  }

  private stateOriginMatchesOrigin(appStateUrl: url.URL) {
    return appStateUrl.origin === globalThis.location.origin;
  }

  private createAppStateUrl(): url.URL {
    const decodedState = atob(decodeURIComponent(this.state)).split(
      '_luigiNonce='
    );
    const appState = decodeURI(decodedState[0] || '');
    return new URL(appState);
  }

  private createNavigationParams(appStateUrl: url.URL): NavigationExtras {
    // appstate an absolute url, so needs some handling
    const extras: NavigationExtras = {};
    if (appStateUrl.searchParams) {
      extras.queryParams = {};
      appStateUrl.searchParams.forEach((value: string, key: string) => {
        if (extras.queryParams) {
          extras.queryParams[key] = value;
        }
      });
    }
    if (appStateUrl.hash?.length > 1) {
      extras.fragment = appStateUrl.hash.substr(1);
    }
    return extras;
  }
}
