import { Sync } from '../sync/sync';
import { BlockBaseScoreStrategy } from '../score/strategy/score';

export class BlockApi<TData = void> {
  constructor(
    public score: BlockBaseScoreStrategy,
    public sync: Sync<TData>,
  ) {
  }

  public destroy(): void {
    this.score.destroy();
    this.sync.destroy();
  }
}
