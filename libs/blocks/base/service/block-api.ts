import { IBlockConfig } from '../interface';
import { Sync } from '../sync/sync';
import { Score } from '../score/score';

export class BlockApi<TData = void> {
  public score: Score;
  public sync: Sync<TData>;

  constructor(
    private config: IBlockConfig,
  ) {
    this.score = new Score(this.config.blockId, this.config.score);
    this.sync = new Sync<TData>(this.config.blockId, this.config.sync);
  }

  public destroy(): void {
    this.score.destroy();
    this.sync.destroy();
  }
}
