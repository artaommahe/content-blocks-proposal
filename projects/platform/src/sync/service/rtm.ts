import { Injectable } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RtmService {
  private broadcastChannel = new BroadcastChannel('blocks');

  public on<T>(): Observable<T> {
    return fromEvent<MessageEvent>(this.broadcastChannel, 'message').pipe(
      map(event => event.data)
    );
  }

  public send<T>(data: T): void {
    this.broadcastChannel.postMessage(data);
  }
}
