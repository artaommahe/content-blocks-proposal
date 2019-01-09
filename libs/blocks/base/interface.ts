import { IBlockScoreConfig, IBlockScoreStrategyConfig } from './score/interface';
import { IBlockSyncConfig } from './sync/interface';
import { BlockBaseModel } from './model/base';
import { BlockConfig } from './config/config';
import { IBlockAnswer } from './model/interface';

export type TBlockId = string;

export interface IBlockConfig {
  score?: IBlockScoreConfig;
  sync?: IBlockSyncConfig;
}

export interface IBlockApiConfig<
  TValue,
  TAnswerData extends Object = {},
  TAnswer extends IBlockAnswer<TValue> & TAnswerData = IBlockAnswer<TValue> & TAnswerData
> {
  blockId?: TBlockId;
  model?: BlockBaseModel<TValue, TAnswerData, TAnswer>;
  blockConfig?: BlockConfig;
  scoreStrategyConfig?: Partial<IBlockScoreStrategyConfig<TValue, TAnswerData, TAnswer>>;
}
