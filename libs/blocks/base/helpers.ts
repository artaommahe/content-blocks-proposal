import { Observable, fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BlockConfig } from './config/config';
import { BlockGroupComponent } from './component/group/group';

export function getParentComponent<T>(element: HTMLElement, selector: string): T | undefined {
  return element.closest(selector) as unknown as T;
}

// CONFIG -->
export const BLOCK_GROUP_SELECTOR = 'sky-block-group';

export function getBlockConfig(element: HTMLElement): BlockConfig {
  const blockGroupElement = getParentComponent<BlockGroupComponent>(element, BLOCK_GROUP_SELECTOR);

  return blockGroupElement
    ? blockGroupElement.blockConfig
    : new BlockConfig();
}
// <--

// GLOBAL EVENTS -->
export interface IBlocksEvent<T> {
  name: string;
  data: T;
}

const BLOCKS_CUSTOM_EVENT = 'blocksCustomEvent';

// TODO: listen once with share
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
// <--
