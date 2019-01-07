import { Component } from '@angular/core';
import { timer } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { IBlockConfig } from '@skyeng/libs/blocks/base/interface';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: [ 'app.scss' ],
})
export class AppComponent {
  public config = '{}';
  // uglyhack only for example, strange bug with empty custom elements inputs
  public initDone$ = timer(0).pipe(mapTo(true));

  public onConfigChange(config: IBlockConfig) {
    this.config = JSON.stringify(config);
  }
}
