import { NgModule } from '@angular/core';
import { PortalComponent, PortalModule } from '@openmfp/portal-ui-lib';

@NgModule({
  imports: [PortalModule.forRoot()],
  bootstrap: [PortalComponent],
})
export class AppModule {}
