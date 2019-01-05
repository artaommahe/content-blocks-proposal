import { MAX_SCORE_DEFAULT } from '../const';
import { IBlockScore, IBlockScoreStrategyConfig } from '../interface';
import { filter, withLatestFrom, scan, map, pairwise, startWith, concatAll, debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockScoreApi } from '../service/score-api';
import { TBlockId } from '../../interface';
import { BlockBaseModel } from '../../model/base';
import { BlockConfig } from '../../config/config';
import { IBlockAnswer } from '../../model/interface';

export class BlockBaseScoreStrategy {
  private blockScoreApi: BlockScoreApi;
  private blockId: TBlockId;
  private model: BlockBaseModel<any> | undefined;
  private blockConfig: BlockConfig;

  private destroyedOptions = { initMethod: this.init, destroyMethod: this.destroy };

  constructor(
    config: IBlockScoreStrategyConfig,
  ) {
    this.blockScoreApi = config.blockScoreApi;
    this.blockId = config.blockId;
    this.model = config.model;
    this.blockConfig = config.blockConfig;

    this.init();
  }

  public destroy(): void {
    this.blockScoreApi.remove(this.blockId);
  }

  public set(score: IBlockScore): void {
    if (!this.isEnabled()) {
      return;
    }

    this.blockScoreApi.set(this.blockId, score);
  }

  private init(): void {
    if (!this.isEnabled()) {
      return;
    }

    const startingScore = this.getStartingScore();
    this.set(startingScore);

    if (this.model) {
      this.bindToModel(this.model);
    }
  }

  private isEnabled(): boolean {
    return !!this.blockConfig.get([ 'score', 'enabled' ]);
  }

  private bindToModel(model: BlockBaseModel<any>): void {
    const startingScore = this.getStartingScore();

    const answer$ = model.answers$.pipe(
      startWith<IBlockAnswer<any>[]>([]),
      pairwise(),
      map(([ prev, next ]) => next.filter(answer => !prev.includes(answer))),
      concatAll(),
    );

    answer$
      .pipe(
        map(answer => answer ? answer.isCorrect : null),
        filter((isCorrect): isCorrect is boolean => isCorrect !== null),
        withLatestFrom(model.correctAnswers$),
        // TODO: distinctUntiChanged, dont send same score when maxScore is reached
        scan<[ boolean, string[] ], IBlockScore>(
          (score, [ isCorrect, correctAnswers ]) => this.handleScore(score, isCorrect, correctAnswers),
          startingScore
        ),
        debounceTime(0),
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(score => this.set(score));
  }

  private getStartingScore(): IBlockScore {
    return {
      right: 0,
      wrong: 0,
      maxScore: this.blockConfig.get([ 'score', 'maxScore' ]) || MAX_SCORE_DEFAULT,
    };
  }

  private handleScore(score: IBlockScore, isCorrect: boolean, correctAnswers: string[]): IBlockScore {
    if ((score.right + score.wrong) >= score.maxScore) {
      return score;
    }

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
