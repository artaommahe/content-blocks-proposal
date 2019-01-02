import { BlockBaseSyncStrategy } from '../sync/strategy/base';
import { BlockBaseScoreStrategy } from '../score/strategy/base';

export class BlockApi<T = void> {
  constructor(
    public score: BlockBaseScoreStrategy,
    public sync: BlockBaseSyncStrategy<T>,
  ) {
  }

  public destroy(): void {
    this.score.destroy();
    this.sync.destroy();
  }
}
