import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LuigiCoreService } from '../service/luigiCore.service';
import { CallbackComponent } from './callback.component';
import { I18nService } from '../service/i18n.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { LogoutComponent } from '../logout/logout.component';
import { Component, ViewChild } from '@angular/core';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

@Component({
  selector: 'app-test-root-component',
  template: '<router-outlet></router-outlet>',
})
class TestRootComponent {
  @ViewChild(RouterOutlet)
  routerOutlet: RouterOutlet;
}

describe('CallbackComponent', () => {
  let router: Router;
  let location: Location;
  let rootFixture: ComponentFixture<TestRootComponent>;
  let rootComponent: TestRootComponent;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CallbackComponent, TestRootComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [
            { path: '', component: TestRootComponent },
            { path: 'logout', component: LogoutComponent },
            { path: 'callback', component: CallbackComponent },
          ],
          {}
        ),
      ],
      providers: [LuigiCoreService, I18nService],
    })
      .overrideProvider(ActivatedRoute, { useValue: Subscription })
      .compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    rootFixture = TestBed.createComponent(TestRootComponent); // [6]
    rootComponent = rootFixture.componentInstance; //

    rootFixture.detectChanges();
  });

  beforeEach(() => {
    const luigiCoreService = TestBed.inject(LuigiCoreService);
    jest
      .spyOn(luigiCoreService, 'ux')
      .mockReturnValue({ hideAppLoadingIndicator: () => {} });
    jest.spyOn(luigiCoreService, 'i18n').mockReturnValue({
      getCurrentLocale: () => {
        return '';
      },
    });

    router = TestBed.inject(Router);
    router.initialNavigation();
    location = TestBed.inject(Location);
  });

  it('redirect to the login error if there is no code', async () => {
    await router.navigate(['/callback']);

    const component = rootComponent.routerOutlet.component;

    expect(component).toBeTruthy();
    expect(location.path()).toBe('/logout?error=loginError');
  });

  it('redirect to the login error if the state does not match', async () => {
    await router.navigate(['/callback'], {
      queryParams: {
        code: 'foo',
      },
    });

    expect(location.path()).toBe('/logout?error=loginError');
  });

  it('redirect to home if everything went well', fakeAsync(() => {
    const state = btoa(encodeURI('http://localhost'));
    router.navigate(['/callback'], {
      queryParams: {
        code: 'foo',
        state,
      },
    });
    tick();
    const authRequest = httpTestingController.expectOne(
      `/rest/auth?code=foo&state=${state}`
    );
    authRequest.flush({
      expires_in: '123123123',
      access_token: 'adwd.dasdd.asdsad',
    });
    tick();

    const component = rootComponent.routerOutlet.component;

    expect(router.getCurrentNavigation()).toBe(null);

    expect(component).toBeTruthy();
    expect(location.path()).toBe('/');
  }));
});
