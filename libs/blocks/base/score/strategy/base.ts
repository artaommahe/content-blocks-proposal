import { MAX_SCORE_DEFAULT } from '../const';
import { IBlockScore, IBlockScoreStrategyConfig, TScoreHandler } from '../interface';
import { scan, map, pairwise, startWith, concatAll, debounceTime, filter, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockScoreApi } from '../service/score-api';
import { TBlockId } from '../../interface';
import { BlockBaseModel } from '../../model/base';
import { BlockConfig } from '../../config/config';
import { IBlockAnswer } from '../../model/interface';

export class BlockBaseScoreStrategy {
  protected blockScoreApi: BlockScoreApi;
  protected blockId: TBlockId;
  protected model: BlockBaseModel<any> | undefined;
  protected blockConfig: BlockConfig;
  protected handlers: TScoreHandler[];
  protected destroyedOptions = { initMethod: this.init, destroyMethod: this.destroy };

  constructor(
    config: IBlockScoreStrategyConfig<any, any>,
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

  protected init(): void {
    if (this.model) {
      this.bindToModel(this.model);
    }
  }

  protected isEnabled(): boolean {
    return !!this.blockConfig.get([ 'score', 'enabled' ]);
  }

  protected bindToModel(model: BlockBaseModel<any>): void {
    const startingScore = this.getStartingScore();

    const score$ = model.answers$.pipe(
      pairwise(),
      map(([ prev, next ]) => next.filter(answer => !prev.includes(answer))),
      concatAll(),
      // TODO: distinctUntiChanged, dont send same score
      scan<IBlockAnswer<any>, IBlockScore>(
        (score, answer) => this.handleScore(score, answer),
        startingScore
      ),
      startWith(startingScore),
      debounceTime(0),
    );

    model.answers$
      .pipe(
        // reset score on empty answers
        filter(answers => !answers.length),
        switchMap(() => score$),
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(score => this.set(score));
  }

  protected getStartingScore(): IBlockScore {
    return {
      right: 0,
      wrong: 0,
      maxScore: this.blockConfig.get([ 'score', 'maxScore' ]) || MAX_SCORE_DEFAULT,
    };
  }

  protected handleScore = (score: IBlockScore, answer: IBlockAnswer<any>): IBlockScore => {
    for (const handler of this.handlers) {
      const newScore = handler(score, answer, this.model!);

      if (newScore) {
        score = newScore;
        break;
      }
    }

    return score;
  }
}
