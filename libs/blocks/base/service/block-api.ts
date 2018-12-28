import { IBlockConfig } from '../interface';
import { Subject, Observable } from 'rxjs';
import { blocksListenGlobalEvent, blocksDispatchGlobalEvent } from '../helpers';
import { filter } from 'rxjs/operators';

// ---> SYNC PART
export const SYNC_EVENTS = {
  set: 'syncSet',
  restore: 'syncRestore',
  data: 'syncData',
};

interface ISyncSet<T> {
  id: string;
  data: T;
}
// <---

// ---> SCORING PART
export const SCORING_EVENTS = {
  addBlock: 'scroringAddBlock',
  set: 'scroringSet',
};

interface IScoringAddBlock {
  id: string;
  // some scoring params
}

interface IScoringSet {
  id: string;
  right: boolean;
  score: number;
}
// <---

export class BlockApi<TData = void> {
  private destroyed = new Subject<void>();

  constructor(
    private config: IBlockConfig,
  ) {
    if (this.scoringIsEnabled()) {
      this.scoringInit();
    }
  }

  public destroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }


  // ---> SYNC PART
  public syncOnRestore(): Observable<TData> {
    return blocksListenGlobalEvent<TData>(SYNC_EVENTS.restore).pipe(
      filter(() => this.syncIsEnabled()),
    );
  }

  public syncOnData(): Observable<TData> {
    return blocksListenGlobalEvent<TData>(SYNC_EVENTS.data).pipe(
      filter(() => this.syncIsEnabled()),
    );
  }

  public syncSet(data: TData): void {
    if (!this.syncIsEnabled()) {
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
  // <---


  // ---> SCORING PART
  public scoringSet(right: boolean, score: number): void {
    blocksDispatchGlobalEvent<IScoringSet>(SCORING_EVENTS.set, {
      id: this.config.id,
      right,
      score,
    });
  }

  private scoringInit(): void {
    blocksDispatchGlobalEvent<IScoringAddBlock>(SCORING_EVENTS.addBlock, {
      id: this.config.id,
    });
  }

  private scoringIsEnabled(): boolean {
    return this.config.scoring && this.config.scoring.enabled;
  }
  // <---
}
