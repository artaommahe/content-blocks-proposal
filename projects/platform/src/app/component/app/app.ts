import { Component } from '@angular/core';
import { IBlockConfig } from '@skyeng/libs/blocks/base/interface';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: [ 'app.scss' ],
})
export class AppComponent {
  public config = '{}';

  public onConfigChange(config: IBlockConfig) {
    this.config = JSON.stringify(config);
  }
}
