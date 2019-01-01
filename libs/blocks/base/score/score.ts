import { IBlockConfig } from '../interface';
import { blocksDispatchGlobalEvent } from '../helpers';
import { BLOCK_SCORE_EVENT } from './const';
import { IBlockScoreSet, IBlockScoreRemove, IBlockScore } from './interface';

const MAX_SCORE_DEFAULT = 1;

export class Score {
  constructor(
    private config: IBlockConfig,
  ) {
    if (this.scoringIsEnabled()) {
      this.scoringInit();
    }
  }

  public destroy(): void {
    blocksDispatchGlobalEvent<IBlockScoreRemove>(BLOCK_SCORE_EVENT.remove, {
      blockId: this.config.blockId,
    });
  }

  public scoringSet(score: IBlockScore): void {
    if (!this.scoringIsEnabled()) {
      return;
    }

    blocksDispatchGlobalEvent<IBlockScoreSet>(BLOCK_SCORE_EVENT.set, {
      blockId: this.config.blockId,
      score,
    });
  }

  private scoringInit(): void {
    this.scoringSet({
      right: 0,
      wrong: 0,
      maxScore: MAX_SCORE_DEFAULT,
    });
  }

  private scoringIsEnabled(): boolean {
    return this.config.scoring && this.config.scoring.enabled;
  }
}
