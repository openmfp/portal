import { NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FrameComponent, FrameModule } from 'projects/frontend-lib/src/public-api';

@NgModule({
  imports: [
    FrameModule
  ],
  bootstrap: [FrameComponent]
})
export class AppModule {
  constructor(private router: Router) {
    
  }
 }

