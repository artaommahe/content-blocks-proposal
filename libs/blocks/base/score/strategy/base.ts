import { MAX_SCORE_DEFAULT } from '../const';
import { IBlockScore, IBlockScoreStrategyConfig, TScoreHandler } from '../interface';
import { scan, map, pairwise, startWith, switchMap, withLatestFrom, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockScoreApi } from '../service/score-api';
import { TBlockId } from '../../core/interface';
import { BlockBaseModel } from '../../model/base';
import { BlockConfig } from '../../config/config';
import { IBlockAnswer } from '../../model/interface';
import { Observable, of, Subject } from 'rxjs';

export class BlockBaseScoreStrategy<
  TModel extends BlockBaseModel<any, any> = BlockBaseModel<any, any>,
  THandlerAnswer = IBlockAnswer<any>,
  THandlerParams = void,
> {
  protected blockScoreApi: BlockScoreApi;
  protected blockId: TBlockId;
  protected model: TModel | undefined;
  protected blockConfig: BlockConfig;
  protected handlers: TScoreHandler<THandlerAnswer, THandlerParams>[] = [];
  protected destroyedOptions = { initMethod: this.init, destroyMethod: this.destroy };
  protected resetSubj = new Subject<void>();

  constructor(
    config: IBlockScoreStrategyConfig<TModel>,
  ) {
    this.blockScoreApi = config.blockScoreApi;
    this.blockId = config.blockId;
    this.model = config.model;
    this.blockConfig = config.blockConfig;
  }

  public init(): void {
    if (this.model) {
      this.bindToModel(this.model);
    }
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

  protected isEnabled(): boolean {
    return !!this.blockConfig.get([ 'score', 'enabled' ]);
  }

  protected bindToModel(model: TModel): void {
    const startingScore = this.getStartingScore();

    const score$ = this.score(model, startingScore).pipe(
      startWith(startingScore),
      distinctUntilChanged((prev, next) =>
        (prev.right === next.right) && (prev.wrong === next.wrong)
      ),
    );

    // reset score
    this.resetSubj.asObservable()
      .pipe(
        startWith(null),
        switchMap(() => score$),
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(score => this.set(score));

    model.reset$
      .pipe(
        takeUntilDestroyed(this, this.destroyedOptions),
      )
      .subscribe(() => this.reset());
  }

  protected reset(): void {
    this.resetSubj.next();
  }

  protected score(model: TModel, startingScore: IBlockScore): Observable<IBlockScore> {
    return this.getScoreAnswers(model).pipe(
      pairwise(),
      map(([ prev, next ]) => next.filter(answer => !prev.includes(answer))),
      withLatestFrom(this.getScoreHandlerParams(model)),
      scan<[ THandlerAnswer[], THandlerParams ], IBlockScore>(
        (lastScore, [ answers, params ]) =>
          // `reduce` instead of `concatAll` before `scan` for single `scan`'s item with final score
          // important optimization on history restoring
          answers.reduce(
            (newScore, answer) => this.handleScore(newScore, answer, params),
            lastScore
          ),
        startingScore
      ),
    );
  }

  protected getScoreAnswers(model: TModel): Observable<THandlerAnswer[]> {
    return <Observable<THandlerAnswer[]>> model.answers$;
  }

  protected getScoreHandlerParams(_model: TModel): Observable<THandlerParams> {
    return of();
  }

  protected getStartingScore(): IBlockScore {
    return {
      right: 0,
      wrong: 0,
      maxScore: this.blockConfig.get([ 'score', 'maxScore' ]) || MAX_SCORE_DEFAULT,
    };
  }

  protected handleScore(score: IBlockScore, answer: THandlerAnswer, params: THandlerParams): IBlockScore {
    return this.handlers.reduce(
      (newScore, handler) => (newScore === score)
        ? (handler(score, answer, params) || newScore)
        : newScore,
      score
    );
  }
}
