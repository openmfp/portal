import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LuigiCoreService } from '../service/luigiCore.service';
import { I18nService } from '../service/i18n.service';

interface UrlParams {
  error: string;
}

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  headline: string = '';
  hint: string = '';
  message = '';
  btnText: string = '';
  loginTarget: string= '';

  private urlParams: Params ={ error: '' }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private luigiCoreService: LuigiCoreService,
    private ref: ChangeDetectorRef,
    private i18nService: I18nService
  ) {}

  async ngOnInit(): Promise<void> {
    this.luigiCoreService.ux().hideAppLoadingIndicator();
    this.parseUrlParameters();
    const error = this.urlParams.error;
    this.headline = await this.i18nService.getTranslationAsync(
      'SUCCESSFULLY_LOGGED_OUT'
    );
    this.hint = await this.i18nService.getTranslationAsync('SIGN_IN_HINT');
    this.btnText = await this.i18nService.getTranslationAsync('LOGIN_AGAIN');

    switch (error) {
      case 'tokenExpired':
        this.headline =
          await this.i18nService.getTranslationAsync('SESSION_EXPIRED');
        const lastRoute = sessionStorage.getItem('dxp.relogin.url');
        if (lastRoute) {
          sessionStorage.removeItem('dxp.relogin.url');
          this.loginTarget = lastRoute;
        }
        break;
      case 'loginError':
        this.headline =
          await this.i18nService.getTranslationAsync('SIGN_IN_ERROR');
        this.hint =
          await this.i18nService.getTranslationAsync('SIGN_IN_ERROR_HINT');
        break;
      case 'invalidToken':
        this.luigiCoreService.auth().store.removeAuthData();
        this.headline = await this.i18nService.getTranslationAsync(
          'INVALID_TOKEN_ERROR'
        );
        this.hint = await this.i18nService.getTranslationAsync(
          'INVALID_TOKEN_ERROR_HINT'
        );
        break;
      default:
        break;
    }

    this.ref.detectChanges();
  }

  login() {
    if (this.loginTarget) {
      history.replaceState({}, '', this.loginTarget);
      window.dispatchEvent(new CustomEvent('popstate'));
    } else {
      this.router.navigate(['/']);
    }
  }

  parseUrlParameters() {
    this.route.queryParams.subscribe((params: Params) => {
      this.urlParams = params;
    });
  }
}
