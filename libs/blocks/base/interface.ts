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
}

// uglyhack for class constructor type
export interface ConstructorType<T> extends Function {
  new (...args: any[]): T;
}

export interface IBlockApiConfig<
  TValue,
  TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>,
  TBlockApi extends BaseBlockApi<TValue, TAnswer> = BaseBlockApi<TValue, TAnswer>,
> {
  blockId?: TBlockId;
  blockConfig?: BlockConfig;
  api?: ConstructorType<TBlockApi>;
  model?: BlockBaseModel<TValue, TAnswer>;
  scoreStrategy?: typeof BlockBaseScoreStrategy;
  scoreStrategyConfig?: Partial<IBlockScoreStrategyConfig<TValue, TAnswer>>;
  syncStrategy?: typeof BlockBaseSyncStrategy;
}
