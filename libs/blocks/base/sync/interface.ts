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

export interface IBlockSyncAnswer<TAnswer extends IBlockAnswer<any>> {
  blockId: TBlockId;
  data: TAnswer;
}

export interface IBlockSyncAddAnswer<TAnswer extends IBlockAnswer<any>> {
  blockId: TBlockId;
  data: TAnswer;
}

export interface IBlockSyncRequestRestoreAnswers {
  blockId: TBlockId;
}

export interface IBlockSyncRestoreAnswers<TAnswer extends IBlockAnswer<any>> {
  blockId: TBlockId;
  data: TAnswer[] | null;
}

export interface IBlockSyncEventData<T> {
  event: string;
  data: T;
}

export interface IBlockSyncEvent<T> {
  blockId: TBlockId;
  eventData: IBlockSyncEventData<T>;
}
