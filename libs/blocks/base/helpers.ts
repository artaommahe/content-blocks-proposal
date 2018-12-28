import { Observable, fromEvent } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

export function getParentComponent<T>(element: HTMLElement, selector: string): T {
  return element.closest(selector) as unknown as T;
}

// GLOBAL EVENTS

export interface IBlocksEvent<T> {
  name: string;
  data: T;
}

const BLOCKS_CUSTOM_EVENT = 'blocksCustomEvent';

export function blocksListenAllGlobalEvents(): Observable<IBlocksEvent<any>> {
  return fromEvent<CustomEvent<IBlocksEvent<any>>>(window, BLOCKS_CUSTOM_EVENT).pipe(
    map(event => event.detail),
  );
}

export function blocksListenGlobalEvent<T>(eventName: string): Observable<T> {
  return blocksListenAllGlobalEvents().pipe(
    filter(({ name }) => name === eventName),
    map(({ data }) => data),
  );
}

export function blocksDispatchGlobalEvent<T>(eventName: string, data: T): void {
  const event = new CustomEvent(BLOCKS_CUSTOM_EVENT, {
    detail: {
      name: eventName,
      data,
    }
  });

  window.dispatchEvent(event);
}
