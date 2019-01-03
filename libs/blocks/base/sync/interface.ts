import { TBlockId } from '../interface';
import { BlockSyncApi } from './service/sync-api';
import { BlockBaseModel } from '../model/base';
import { BlockConfig } from '../config/config';

export interface IBlockSyncConfig {
  enabled?: boolean;
}

export interface IBlockSyncStrategyConfig<T> {
  blockSyncApi: BlockSyncApi;
  blockId: TBlockId;
  blockConfig: BlockConfig;
  model?: BlockBaseModel<T>;
}

export interface IBlockSyncData<T> {
  blockId: TBlockId;
  data: T;
}

export interface IBlockSyncRequestRestore {
  blockId: TBlockId;
}
