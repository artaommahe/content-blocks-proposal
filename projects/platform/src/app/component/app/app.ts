import { Component, OnInit } from '@angular/core';
import { Observable, timer, BehaviorSubject } from 'rxjs';
import { mapTo, map } from 'rxjs/operators';
import { IBlockConfig } from '@skyeng/libs/blocks/base/interface';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: [ 'app.scss' ],
})
export class AppComponent implements OnInit {
  private config = new BehaviorSubject<IBlockConfig>({});

  public config$: Observable<string>;
  // uglyhack only for example, strange bug with empty custom elements inputs
  public initDone$ = timer(0).pipe(mapTo(true));

  public ngOnInit() {
    this.config.next({
      sync: {
        enabled: true,
      },
      score: {
        enabled: true,
      }
    });

    this.config$ = this.config.asObservable().pipe(
      map(config => JSON.stringify(config)),
    );
  }
}
