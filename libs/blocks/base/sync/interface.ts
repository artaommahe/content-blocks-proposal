import { TBlockId } from '../interface';
import { BlockSyncApi } from './service/sync-api';
import { BlockBaseModel } from '../model/base';
import { BlockConfig } from '../config/config';
import { IBlockAnswer } from '../model/interface';

export interface IBlockSyncConfig {
  enabled?: boolean;
}

export interface IBlockSyncStrategyConfig<TValue, TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>> {
  blockSyncApi: BlockSyncApi;
  blockId: TBlockId;
  blockConfig: BlockConfig;
  model?: BlockBaseModel<TValue, TAnswer>;
}

export interface IBlockSyncData<TValue> {
  blockId: TBlockId;
  data: TValue | null;
}

export interface IBlockSyncAdd<TValue> {
  blockId: TBlockId;
  data: IBlockAnswer<TValue>;
}

export interface IBlockSyncRequestRestore {
  blockId: TBlockId;
}

export interface IBlockSyncRestore<TValue> {
  blockId: TBlockId;
  data: IBlockAnswer<TValue>[] | null;
}
