import { IBlockScoreConfig } from './score/interface';
import { IBlockSyncConfig } from './sync/interface';
import { BlockBaseModel } from './model/base';

export type TBlockId = string;

export interface IBlockConfig {
  score?: IBlockScoreConfig;
  sync?: IBlockSyncConfig;
}

export interface IBlockApiConfig<T> {
  blockId?: TBlockId;
  model?: BlockBaseModel<T>;
  blockConfig?: IBlockConfig;
}
