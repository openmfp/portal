import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PortalComponent {
  configLoaded = false;
  constructor() {}
}
