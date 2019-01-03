import { TBlockId } from '../interface';
import { BlockSyncApi } from './service/sync-api';
import { BlockBaseModel } from '../model/base';

export interface IBlockSyncConfig {
  enabled?: boolean;
}

export interface IBlockSyncStrategyConfig<T> {
  blockSyncApi: BlockSyncApi;
  blockId: TBlockId;
  model?: BlockBaseModel<T>;
  syncConfig?: IBlockSyncConfig;
}

export interface IBlockSyncData<T> {
  blockId: TBlockId;
  data: T;
}

export interface IBlockSyncRequestRestore {
  blockId: TBlockId;
}
