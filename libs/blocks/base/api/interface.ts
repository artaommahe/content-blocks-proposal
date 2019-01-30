import { BlockBaseModel } from '../model/base';
import { BlockConfig } from '../config/config';
import { BlockBaseScoreStrategy } from '../score/strategy/base';
import { BlockBaseSyncStrategy } from '../sync/strategy/base';
import { TBlockId } from '../core/interface';

export interface IBlockApiConfig<
  TModel extends BlockBaseModel<any, any>,
  TScoreStrategy extends BlockBaseScoreStrategy<TModel, any, any>,
> {
  blockId?: TBlockId;
  blockConfig?: BlockConfig;
  model?: Constructor<TModel>;
  scoreStrategy?: Constructor<TScoreStrategy>;
  syncStrategy?: typeof BlockBaseSyncStrategy;
}
