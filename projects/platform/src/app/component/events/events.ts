import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { IBlocksEvent } from '@skyeng/libs/blocks/base/events/interface';
import { blocksListenAllGlobalEvents, blocksDispatchGlobalEvent } from '@skyeng/libs/blocks/base/events/events';

@Component({
  selector: 'events',
  templateUrl: 'events.html',
  styleUrls: [ 'events.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsComponent implements OnInit {
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

    if (!eventData) {
      return;
    }

    blocksDispatchGlobalEvent(eventData.name, eventData.data);
  }
}
