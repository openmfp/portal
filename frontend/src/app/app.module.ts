import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { FrameComponent, FrameModule } from 'projects/frontend-lib/src/public-api';

@NgModule({
  imports: [
    FrameModule
  ],
  bootstrap: [FrameComponent]
})
export class AppModule {
  constructor(private router: Router) {
    router.routeReuseStrategy.shouldReuseRoute = (
      future: ActivatedRouteSnapshot,
      curr: ActivatedRouteSnapshot,
    ) => {
      return (
        future.routeConfig === curr.routeConfig ||
        future.routeConfig?.component === curr.routeConfig?.component
      );
    };
  }
 }

