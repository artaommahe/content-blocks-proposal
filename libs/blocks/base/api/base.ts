import { BlockBaseSyncStrategy } from '../sync/strategy/base';
import { BlockBaseScoreStrategy } from '../score/strategy/base';
import { IBlockAnswer } from '../model/interface';
import { IDestroyedStreamOptions } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockBaseModel } from '../model/base';
import { BlockSimpleScoreStrategy } from '../score/strategy/simple';
import { Observable } from 'rxjs';
import { skip, debounceTime, take, mapTo } from 'rxjs/operators';

export class BaseBlockApi<
  TValue = void,
  TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>,
  TModel extends BlockBaseModel<TValue, TAnswer> = BlockBaseModel<TValue, TAnswer>,
  TScoreStrategy extends BlockBaseScoreStrategy<TModel, any, any> = BlockSimpleScoreStrategy<TModel>,
> {
  public correctAnswersInited$: Observable<void>;

  protected destroyedOptions: IDestroyedStreamOptions = { initMethod: this.init, destroyMethod: this.destroy };

  constructor(
    public model: TModel,
    public score: TScoreStrategy,
    public sync: BlockBaseSyncStrategy<TAnswer, TModel>,
  ) {
    this.correctAnswersInited$ = this.model.correctAnswers$.pipe(
      skip(1),
      debounceTime(0),
      take(1),
      mapTo(undefined),
    );
  }

  public init(): void {
    this.score.init();
    this.sync.init();
  }

  public destroy(): void {
    this.score.destroy();
    this.sync.destroy();
  }
}
