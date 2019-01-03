import { TBlockId } from '../../interface';
import { MAX_SCORE_DEFAULT } from '../const';
import { BlockScoreApi } from '../service/score-api';
import { IBlockScoreConfig, IBlockScore } from '../interface';
import { BlockBaseModel } from '../../model/base';
import { filter, withLatestFrom, scan } from 'rxjs/operators';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';

export class BlockBaseScoreStrategy {
  private destroyedOptions = { initMethod: this.init, destroyMethod: this.destroy };

  constructor(
    private blockScoreService: BlockScoreApi,
    private model: BlockBaseModel<any>,
    private blockId: TBlockId,
    private config: IBlockScoreConfig,
  ) {
    this.init();
  }

  public destroy(): void {
    this.blockScoreService.remove(this.blockId);
  }

  private set(score: IBlockScore): void {
    if (!this.isEnabled()) {
      return;
    }

    this.blockScoreService.set(this.blockId, score);
  }

  private init(): void {
    if (!this.isEnabled()) {
      return;
    }

    const startingScore = this.getStartingScore();
    this.set(startingScore);

    this.model.isCorrect$
      .pipe(
        filter(isCorrect => isCorrect !== null),
        withLatestFrom(this.model.correctAnswers$),
        scan<[ boolean, string[] ], IBlockScore>(
          (score, [ isCorrect, correctAnswers ]) => this.handleScore(score, isCorrect, correctAnswers),
          startingScore
        ),
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(score => this.set(score));
  }

  private isEnabled(): boolean {
    return this.config.enabled;
  }

  private getStartingScore(): IBlockScore {
    return {
      right: 0,
      wrong: 0,
      maxScore: this.config.maxScore || MAX_SCORE_DEFAULT,
    };
  }

  private handleScore(score: IBlockScore, isCorrect: boolean, correctAnswers: string[]): IBlockScore {
    if (isCorrect) {
      return {
        ...score,
        right: score.right + (score.maxScore - score.wrong),
      };
    }
    else {
      return {
        ...score,
        wrong: score.wrong + (score.maxScore / (correctAnswers.length - 1)),
      };
    }
  }
}
