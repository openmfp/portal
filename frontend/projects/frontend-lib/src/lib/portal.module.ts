import { NgModule } from '@angular/core';
import { LuigiComponent } from './luigi/luigi.component';
import { PortalComponent } from './portal.component';
import { RouterModule } from '@angular/router';
import { PortalRoutingModule } from './portal-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { LuigiconfigService } from './service/luigiConfig/luigiconfig.service';
import { LuigiCoreService } from './service/luigiCore.service';
import { EnvConfigService } from './service/env-config.service';
import { AuthService } from './service/auth.service';
import { ConfigService } from './service/portalConfig/config.service';
import { HttpClientModule } from '@angular/common/http';
import { StorageService } from './service/storage.service';
import { CallbackComponent } from './callback/callback.component';
import { LogoutComponent } from './logout/logout.component';
import { I18nService } from './service/i18n.service';



@NgModule({
  declarations: [
    PortalComponent,
    LuigiComponent,
    CallbackComponent,
    LogoutComponent
  ],
  providers: [
    LuigiconfigService,
    LuigiCoreService,
    AuthService,
    EnvConfigService,
    ConfigService,
    StorageService,
    I18nService
  ],
  imports: [
    RouterModule,
    PortalRoutingModule,
    BrowserModule,
    HttpClientModule
  ],
  exports: [
    PortalComponent
  ],
  bootstrap: [PortalComponent],
})
export class PortalModule {
  constructor() {}
}

