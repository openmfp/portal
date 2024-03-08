import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LuigiComponent } from './luigi/luigi.component';
import { CallbackComponent } from './callback/callback.component';
import { LogoutComponent } from './logout/logout.component';

const routes: Routes = [
  { path: 'callback', component: CallbackComponent },
  { path: 'logout', component: LogoutComponent },
  { path: '', component: LuigiComponent },
  { path: '**', component: LuigiComponent },
];

const routerModuleModuleWithProviders = RouterModule.forRoot(routes);

@NgModule({
  imports: [routerModuleModuleWithProviders],
  exports: [RouterModule],
})
export class PortalRoutingModule {
  constructor() {}
}
