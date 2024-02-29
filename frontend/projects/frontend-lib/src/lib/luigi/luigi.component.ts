import { Component } from '@angular/core';
import { LuigiconfigService } from '../service/luigiConfig/luigiconfig.service';

@Component({
  selector: 'app-luigi',
  templateUrl: './luigi.component.html',
})
export class LuigiComponent {
  constructor(luigiService: LuigiconfigService) {
    luigiService
      .setLuigiConfiguration()
      .catch((e: Error) =>
        console.error(`Luigi Component init failed: ${e.toString()}`)
      );
  }
}
