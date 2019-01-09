import { BlockBaseSyncStrategy } from '../sync/strategy/base';
import { BlockBaseScoreStrategy } from '../score/strategy/base';
import { IBlockAnswer } from '../model/interface';

export class BlockApi<
  TValue = void,
  TAnswerData extends Object = {},
  TAnswer extends IBlockAnswer<TValue> & TAnswerData = IBlockAnswer<TValue> & TAnswerData
> {
  constructor(
    public score: BlockBaseScoreStrategy,
    public sync: BlockBaseSyncStrategy<TValue, TAnswer>,
  ) {
  }

  public destroy(): void {
    this.score.destroy();
    this.sync.destroy();
  }
}
