import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LuigiComponent } from './luigi/luigi.component';

const routes: Routes = [
  { path: '', component: LuigiComponent },
  { path: '**', component: LuigiComponent },
];

const routerModuleModuleWithProviders = RouterModule.forRoot(routes);

@NgModule({
  imports: [routerModuleModuleWithProviders],
  exports: [RouterModule],
})
export class FrameRoutingModule {
  constructor() {}
}
