import { IBlockConfig } from '../interface';
import { Subject } from 'rxjs';
import { Sync } from '../sync/sync';
import { Score } from '../score/score';

export class BlockApi<TData = void> {
  public score: Score;
  public sync: Sync<TData>;

  private destroyed = new Subject<void>();

  constructor(
    private config: IBlockConfig,
  ) {
    this.score = new Score(this.config);
    this.sync = new Sync<TData>(this.config);
  }

  public destroy(): void {
    this.destroyed.next();
    this.destroyed.complete();

    this.score.destroy();
    this.sync.destroy();
  }
}
