import { Component, OnInit } from '@angular/core';
import { IBlocksEvent, blocksListenAllGlobalEvents, blocksDispatchGlobalEvent } from '@skyeng/libs/blocks/base/helpers';
import { Observable, timer } from 'rxjs';
import { scan, mapTo } from 'rxjs/operators';
import { BLOCK_SYNC_EVENTS } from '@skyeng/libs/blocks/base/sync/const';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: [ 'app.scss' ],
})
export class AppComponent implements OnInit {
  // uglyhack only for example, strange bug with empty custom elements inputs
  public initDone$ = timer(0).pipe(mapTo(true));

  public eventData = '';
  public events$: Observable<IBlocksEvent<any>[]>;

  public ngOnInit() {
    this.events$ = blocksListenAllGlobalEvents().pipe(
      scan<IBlocksEvent<any>>((events, event) => ([ event, ...events ]), []),
    );
  }

  public sendEvent(): void {
    let eventData: any;

    try {
      eventData = JSON.parse(this.eventData);
    } catch {}

    this.eventData = '';

    if (!eventData) {
      return;
    }

    blocksDispatchGlobalEvent(BLOCK_SYNC_EVENTS.data, eventData);
  }
}