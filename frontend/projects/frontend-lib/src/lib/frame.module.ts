import { NgModule } from '@angular/core';
import { LuigiComponent } from './luigi/luigi.component';
import { FrameComponent } from './frame.component';
import { RouterModule } from '@angular/router';
import { FrameRoutingModule } from './frame-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { LuigiconfigService } from './service/luigiConfig/luigiconfig.service';
import { LuigiCoreService } from './service/luigiCore.service';
import { EnvConfigService } from './service/env-config.service';
import { AuthService } from './service/auth.service';
import { ConfigService } from './service/frameConfig/config.service';
import { HttpClientModule } from '@angular/common/http';
import { StorageService } from './service/storage.service';
import { CallbackComponent } from './callback/callback.component';
import { LogoutComponent } from './logout/logout.component';
import { I18nService } from './service/i18n.service';



@NgModule({
  declarations: [
    FrameComponent,
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
    FrameRoutingModule,
    BrowserModule,
    HttpClientModule
  ],
  exports: [
    FrameComponent
  ],
  bootstrap: [FrameComponent],
})
export class FrameModule {
  constructor() {}
}

