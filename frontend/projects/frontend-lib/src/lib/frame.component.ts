import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FrameComponent {
  configLoaded = false;
  constructor() {}
}
