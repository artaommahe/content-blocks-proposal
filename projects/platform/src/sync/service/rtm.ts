import { Injectable } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { IRtmEvent } from '../interface';

@Injectable({ providedIn: 'root' })
export class RtmService {
  private broadcastChannel = new BroadcastChannel('blocks');

  public on<T>(event: string): Observable<T> {
    return fromEvent<MessageEvent>(this.broadcastChannel, 'message').pipe(
      map(messageEvent => <IRtmEvent<T>> messageEvent.data),
      filter(rtmEvent => rtmEvent.event === event),
      map(({ data }) => data),
    );
  }

  public send<T>(event: string, data: T): void {
    const rtmEvent: IRtmEvent<T> = { event, data };

    this.broadcastChannel.postMessage(rtmEvent);
  }
}
