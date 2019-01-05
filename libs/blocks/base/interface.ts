import { IBlockScoreConfig } from './score/interface';
import { IBlockSyncConfig } from './sync/interface';
import { BlockBaseModel } from './model/base';
import { BlockConfig } from './config/config';
import { IBlockAnswer } from './model/interface';

export type TBlockId = string;

export interface IBlockConfig {
  score?: IBlockScoreConfig;
  sync?: IBlockSyncConfig;
}

export interface IBlockApiConfig<TValue, TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>> {
  blockId?: TBlockId;
  model?: BlockBaseModel<TValue, TAnswer>;
  blockConfig?: BlockConfig;
}
