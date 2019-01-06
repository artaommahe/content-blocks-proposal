import { MAX_SCORE_DEFAULT } from '../const';
import { IBlockScore, IBlockScoreStrategyConfig, TScoreHandler } from '../interface';
import { scan, map, pairwise, startWith, concatAll, debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockScoreApi } from '../service/score-api';
import { TBlockId } from '../../interface';
import { BlockBaseModel } from '../../model/base';
import { BlockConfig } from '../../config/config';
import { IBlockAnswer } from '../../model/interface';
import { getStreamValue } from '@skyeng/libs/base/helpers';

export class BlockBaseScoreStrategy {
  private blockScoreApi: BlockScoreApi;
  private blockId: TBlockId;
  private model: BlockBaseModel<any> | undefined;
  private blockConfig: BlockConfig;
  private handlers: TScoreHandler[];

  private destroyedOptions = { initMethod: this.init, destroyMethod: this.destroy };

  constructor(
    config: IBlockScoreStrategyConfig,
  ) {
    this.blockScoreApi = config.blockScoreApi;
    this.blockId = config.blockId;
    this.model = config.model;
    this.blockConfig = config.blockConfig;

    // TODO: convert handlers to Observables
    this.handlers = [
      this.handleSameScore,
      ...(config.handlers || []),
      this.handleCorrectScore,
      this.handleWrongScore,
    ];

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
        // TODO: distinctUntiChanged, dont send same score
        scan<IBlockAnswer<any>, IBlockScore>(
          (score, answer) => this.handleScore(score, answer),
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

  protected handleScore = (score: IBlockScore, answer: IBlockAnswer<any>): IBlockScore => {
    for (const handler of this.handlers) {
      const newScore = handler(score, answer);

      if (newScore) {
        score = newScore;
        break;
      }
    }

    return score;
  }

  protected handleSameScore: TScoreHandler = (score, answer) => {
    if (
      ((score.right + score.wrong) >= score.maxScore)
      || (answer.isCorrect === null)
    ) {
      return score;
    }

    return;
  }

  protected handleCorrectScore: TScoreHandler = (score, answer) => {
    if (answer.isCorrect !== true) {
      return;
    }

    return {
      ...score,
      right: score.right + (score.maxScore - score.wrong),
    };
  }

  protected handleWrongScore: TScoreHandler = (score, answer) => {
    if (answer.isCorrect !== false) {
      return;
    }

    const correctAnswers = getStreamValue(this.model!.correctAnswers$);

    return {
      ...score,
      wrong: score.wrong + (score.maxScore / (correctAnswers.length - 1)),
    };
  }
}
