import { TBlockId } from '../interface';
import { blocksDispatchGlobalEvent } from '../helpers';
import { BLOCK_SCORE_EVENT, MAX_SCORE_DEFAULT } from './const';
import { IBlockScoreSet, IBlockScoreRemove, IBlockScore, IBlockScoreConfig } from './interface';

export class Score {
  constructor(
    private blockId: TBlockId,
    private config: IBlockScoreConfig,
  ) {
    this.init();
  }

  public destroy(): void {
    blocksDispatchGlobalEvent<IBlockScoreRemove>(BLOCK_SCORE_EVENT.remove, {
      blockId: this.blockId,
    });
  }

  public set(score: IBlockScore): void {
    if (!this.isEnabled()) {
      return;
    }

    blocksDispatchGlobalEvent<IBlockScoreSet>(BLOCK_SCORE_EVENT.set, {
      blockId: this.blockId,
      score,
    });
  }

  private init(): void {
    if (!this.isEnabled()) {
      return;
    }

    this.set({
      right: 0,
      wrong: 0,
      maxScore: this.config.maxScore || MAX_SCORE_DEFAULT,
    });
  }

  private isEnabled(): boolean {
    return this.config.enabled;
  }
}
