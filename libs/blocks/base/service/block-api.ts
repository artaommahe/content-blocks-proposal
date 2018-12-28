import { IBlockConfig } from '../interface';
import { Subject, Observable } from 'rxjs';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '../helpers';
import { skipWhile } from 'rxjs/operators';

// SYNC PART
export const SYNC_EVENTS = {
  set: 'syncSet',
  restore: 'syncRestore',
  data: 'syncData',
};

interface ISyncSet<T> {
  id: string;
  data: T;
}

export class BlockApi<TData = void> {
  private destroyed = new Subject<void>();

  constructor(
    private config: IBlockConfig,
  ) {
  }

  public destroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }


  // SYNC PART

  public syncOnRestore(): Observable<TData> {
    return blocksListenGlobalEvent<TData>(SYNC_EVENTS.restore).pipe(
      skipWhile(() => !this.syncIsEnabled()),
    );
  }

  public syncOnData(): Observable<TData> {
    return blocksListenGlobalEvent<TData>(SYNC_EVENTS.data).pipe(
      skipWhile(() => !this.syncIsEnabled()),
    );
  }

  public syncSet(data: TData): void {
    if (!this.syncIsEnabled) {
      return;
    }

    blocksDispatchGlobalEvent<ISyncSet<TData>>(SYNC_EVENTS.set, {
      id: this.config.id,
      data,
    });
  }

  private syncIsEnabled(): boolean {
    return this.config.sync && this.config.sync.enabled;
  }


  // SCORING PART
}
