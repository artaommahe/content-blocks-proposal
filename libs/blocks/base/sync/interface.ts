import { TBlockId } from '../interface';
import { BlockSyncApi } from './service/sync-api';
import { BlockBaseModel } from '../model/base';
import { BlockConfig } from '../config/config';
import { IAnswer } from '../model/interface';

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
  data: T | null;
}

export interface IBlockSyncAdd<T> {
  blockId: TBlockId;
  data: IAnswer<T>;
}

export interface IBlockSyncRequestRestore {
  blockId: TBlockId;
}

export interface IBlockSyncRestore<T> {
  blockId: TBlockId;
  data: IAnswer<T>[] | null;
}
