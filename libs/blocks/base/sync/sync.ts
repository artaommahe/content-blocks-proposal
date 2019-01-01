import { IBlockConfig } from '../interface';
import { Observable } from 'rxjs';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '../helpers';
import { filter, map } from 'rxjs/operators';
import { BLOCK_SYNC_EVENTS } from './const';
import { IBlockSyncData } from './interface';

// TODO: (?) convert to sync strategy
export class Sync<TData> {
  constructor(
    private config: IBlockConfig,
  ) {
  }

  public destroy(): void {
    //
  }

  public syncOnRestore(): Observable<TData> {
    return blocksListenGlobalEvent<IBlockSyncData<TData>>(BLOCK_SYNC_EVENTS.restore).pipe(
      filter(({ blockId }) => this.syncIsEnabled() && (blockId === this.config.blockId)),
      map(({ data }) => data),
    );
  }

  public syncOnData(): Observable<TData> {
    return blocksListenGlobalEvent<IBlockSyncData<TData>>(BLOCK_SYNC_EVENTS.data).pipe(
      filter(({ blockId }) => this.syncIsEnabled() && (blockId === this.config.blockId)),
      map(({ data }) => data),
    );
  }

  public syncSet(data: TData): void {
    if (!this.syncIsEnabled()) {
      return;
    }

    blocksDispatchGlobalEvent<IBlockSyncData<TData>>(BLOCK_SYNC_EVENTS.set, {
      blockId: this.config.blockId,
      data,
    });
  }

  private syncIsEnabled(): boolean {
    return this.config.sync && this.config.sync.enabled;
  }
}
