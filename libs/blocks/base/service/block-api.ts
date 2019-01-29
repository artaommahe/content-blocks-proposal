import { BlockBaseSyncStrategy } from '../sync/strategy/base';
import { BlockBaseScoreStrategy } from '../score/strategy/base';
import { IBlockAnswer } from '../model/interface';
import { IDestroyedStreamOptions } from '@skyeng/libs/base/operator/take-until-destroyed';
import { BlockBaseModel } from '../model/base';

export class BaseBlockApi<
  TValue = void,
  TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>,
  TModel extends BlockBaseModel<TValue, TAnswer> = BlockBaseModel<TValue, TAnswer>,
> {
  protected destroyedOptions: IDestroyedStreamOptions = { initMethod: this.init, destroyMethod: this.destroy };

  constructor(
    public model: TModel,
    public score: BlockBaseScoreStrategy<TValue, TAnswer, TModel>,
    public sync: BlockBaseSyncStrategy<TValue, TAnswer>,
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
