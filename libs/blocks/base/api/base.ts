import { BlockBaseSyncStrategy } from '../sync/strategy/base';
import { BlockBaseScoreStrategy } from '../score/strategy/base';
import { IBlockAnswer } from '../model/interface';
import { IDestroyedStreamOptions } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockBaseModel } from '../model/base';
import { BlockSimpleScoreStrategy } from '../score/strategy/simple';

export class BaseBlockApi<
  TValue = void,
  TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>,
  TModel extends BlockBaseModel<TValue, TAnswer> = BlockBaseModel<TValue, TAnswer>,
  TScoreStrategy extends BlockBaseScoreStrategy<TModel, any, any> = BlockSimpleScoreStrategy<TModel>,
> {
  protected destroyedOptions: IDestroyedStreamOptions = { initMethod: this.init, destroyMethod: this.destroy };

  constructor(
    public model: TModel | undefined,
    public score: TScoreStrategy,
    public sync: BlockBaseSyncStrategy<TAnswer, TModel>,
  ) {
    this.init();
  }

  public init(): void {
  }

  public destroy(): void {
    this.score.destroy();
    this.sync.destroy();
  }
}
