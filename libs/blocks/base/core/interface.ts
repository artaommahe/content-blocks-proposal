import { IBlockScoreConfig } from '../score/interface';
import { IBlockSyncConfig } from '../sync/interface';
import { BlockBaseModel } from '../model/base';
import { BlockConfig } from '../config/config';
import { BlockBaseScoreStrategy } from '../score/strategy/base';
import { BlockBaseSyncStrategy } from '../sync/strategy/base';

export type TBlockId = string;

export interface IBlockConfig {
  score?: IBlockScoreConfig;
  sync?: IBlockSyncConfig;
  isMobile?: boolean;
}

export interface IBlockApiConfig<
  TModel extends BlockBaseModel<any, any>,
  TScoreStrategy extends BlockBaseScoreStrategy<TModel, any, any>,
> {
  blockId?: TBlockId;
  blockConfig?: BlockConfig;
  model?: TModel;
  scoreStrategy?: Constructor<TScoreStrategy>;
  syncStrategy?: typeof BlockBaseSyncStrategy;
}
