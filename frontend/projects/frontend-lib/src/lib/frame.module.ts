import { NgModule } from '@angular/core';
import { LuigiComponent } from './luigi/luigi.component';
import { FrameComponent } from './frame.component';
import { RouterModule } from '@angular/router';
import { FrameRoutingModule } from './frame-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { LuigiconfigService } from './service/luigiConfig/luigiconfig.service';
import { LuigiCoreService } from './service/luigiCore.service';



@NgModule({
  declarations: [
    FrameComponent,
    LuigiComponent
  ],
  providers: [
    LuigiconfigService,
    LuigiCoreService,
  ],
  imports: [
    RouterModule,
    FrameRoutingModule,
    BrowserModule
  ],
  exports: [
    FrameComponent
  ],
  bootstrap: [FrameComponent],
})
export class FrameModule {
  constructor() {}
}

