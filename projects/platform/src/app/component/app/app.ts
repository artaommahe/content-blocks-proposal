import { Component, OnInit } from '@angular/core';
import { IBlocksEvent, blocksListenAllGlobalEvents, blocksDispatchGlobalEvent } from '@skyeng/libs/blocks/base/helpers';
import { Observable, timer, BehaviorSubject } from 'rxjs';
import { scan, mapTo, map } from 'rxjs/operators';
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
  public eventData = '';
  public events$: Observable<IBlocksEvent<any>[]>;

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

    this.events$ = blocksListenAllGlobalEvents().pipe(
      scan<IBlocksEvent<any>>((events, event) => ([ event, ...events ]), []),
    );
  }

  public sendEvent(): void {
    let eventData: any;

    try {
      eventData = JSON.parse(this.eventData);
    } catch {}

    if (!eventData) {
      return;
    }

    blocksDispatchGlobalEvent(eventData.name, eventData.data);
  }
}
