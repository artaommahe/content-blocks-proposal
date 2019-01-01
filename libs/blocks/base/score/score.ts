import { IBlockConfig } from '../interface';
import { blocksDispatchGlobalEvent } from '../helpers';
import { SCORING_EVENTS } from './const';
import { IScoringSet, IScoringAddBlock } from './interface';

export class Score {
  constructor(
    private config: IBlockConfig,
  ) {
    if (this.scoringIsEnabled()) {
      this.scoringInit();
    }
  }

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
}
