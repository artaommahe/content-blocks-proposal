import { IBlockScoreConfig, IBlockScoreStrategyConfig } from './score/interface';
import { IBlockSyncConfig } from './sync/interface';
import { BlockBaseModel } from './model/base';
import { BlockConfig } from './config/config';
import { IBlockAnswer } from './model/interface';
import { BlockBaseScoreStrategy } from './score/strategy/base';
import { BlockBaseSyncStrategy } from './sync/strategy/base';
import { BaseBlockApi } from './service/block-api';

export type TBlockId = string;

export interface IBlockConfig {
  score?: IBlockScoreConfig;
  sync?: IBlockSyncConfig;
  isMobile?: boolean;
}

// uglyhack for class constructor type
export interface ConstructorType<T> extends Function {
  new (...args: any[]): T;
}

export interface IBlockApiConfig<
  TValue,
  TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>,
  TModel extends BlockBaseModel<TValue, TAnswer> = BlockBaseModel<TValue, TAnswer>,
  TBlockApi extends BaseBlockApi<TValue, TAnswer> = BaseBlockApi<TValue, TAnswer>,
  TScoreStrategy extends BlockBaseScoreStrategy<TValue, TAnswer, TModel> = BlockBaseScoreStrategy<TValue, TAnswer, TModel>,
> {
  blockId?: TBlockId;
  blockConfig?: BlockConfig;
  api?: ConstructorType<TBlockApi>;
  model?: TModel;
  scoreStrategy?: ConstructorType<TScoreStrategy>;
  scoreStrategyConfig?: Partial<IBlockScoreStrategyConfig<TValue, TAnswer, TModel>>;
  syncStrategy?: typeof BlockBaseSyncStrategy;
}
