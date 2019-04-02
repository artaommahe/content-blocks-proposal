import { Observable, fromEvent } from 'rxjs';
import { IBlocksEvent } from './interface';
import { map, filter, shareReplay } from 'rxjs/operators';
import { BLOCKS_CUSTOM_EVENT } from './const';

// single shared custom event listener
const events$ = fromEvent<CustomEvent<IBlocksEvent<any>>>(window, BLOCKS_CUSTOM_EVENT).pipe(
  map(event => event.detail),
  shareReplay(1),
);

export function blocksListenAllGlobalEvents(): Observable<IBlocksEvent<any>> {
  return events$;
}

export function blocksListenGlobalEvent<T>(eventName: string): Observable<T> {
  return blocksListenAllGlobalEvents().pipe(
    filter(({ name }) => name === eventName),
    map(({ data }) => data),
  );
}

export function blocksDispatchGlobalEvent<T>(name: string, data: T): void {
  const event = new CustomEvent(BLOCKS_CUSTOM_EVENT, {
    detail: { name, data }
  });

  window.dispatchEvent(event);
}
