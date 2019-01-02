import { TBlockId } from '../interface';
import { Observable } from 'rxjs';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '../helpers';
import { filter, map } from 'rxjs/operators';
import { BLOCK_SYNC_EVENTS } from './const';
import { IBlockSyncData, IBlockSyncConfig } from './interface';

// TODO: (?) convert to sync strategy
export class Sync<TData> {
  constructor(
    private blockId: TBlockId,
    private config: IBlockSyncConfig,
  ) {
  }

  public destroy(): void {
    //
  }

  public onRestore(): Observable<TData> {
    return blocksListenGlobalEvent<IBlockSyncData<TData>>(BLOCK_SYNC_EVENTS.restore).pipe(
      filter(({ blockId }) => this.isEnabled() && (blockId === this.blockId)),
      map(({ data }) => data),
    );
  }

  public onData(): Observable<TData> {
    return blocksListenGlobalEvent<IBlockSyncData<TData>>(BLOCK_SYNC_EVENTS.data).pipe(
      filter(({ blockId }) => this.isEnabled() && (blockId === this.blockId)),
      map(({ data }) => data),
    );
  }

  public set(data: TData): void {
    if (!this.isEnabled()) {
      return;
    }

    blocksDispatchGlobalEvent<IBlockSyncData<TData>>(BLOCK_SYNC_EVENTS.set, {
      blockId: this.blockId,
      data,
    });
  }

  private isEnabled(): boolean {
    return this.config && this.config.enabled;
  }
}
