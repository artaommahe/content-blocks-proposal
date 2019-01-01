import { IBlockConfig } from '../interface';
import { Observable } from 'rxjs';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '../helpers';
import { filter, map } from 'rxjs/operators';
import { SYNC_EVENTS } from './const';
import { ISyncData } from './interface';

// TODO: (?) convert to sync strategy
export class Sync<TData> {
  constructor(
    private config: IBlockConfig,
  ) {
  }

  public syncOnRestore(): Observable<TData> {
    return blocksListenGlobalEvent<ISyncData<TData>>(SYNC_EVENTS.restore).pipe(
      filter(({ id }) => this.syncIsEnabled() && (id === this.config.id)),
      map(({ data }) => data),
    );
  }

  public syncOnData(): Observable<TData> {
    return blocksListenGlobalEvent<ISyncData<TData>>(SYNC_EVENTS.data).pipe(
      filter(({ id }) => this.syncIsEnabled() && (id === this.config.id)),
      map(({ data }) => data),
    );
  }

  public syncSet(data: TData): void {
    if (!this.syncIsEnabled()) {
      return;
    }

    blocksDispatchGlobalEvent<ISyncData<TData>>(SYNC_EVENTS.set, {
      id: this.config.id,
      data,
    });
  }

  private syncIsEnabled(): boolean {
    return this.config.sync && this.config.sync.enabled;
  }
}
