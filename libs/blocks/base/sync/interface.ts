import { TBlockId } from '../interface';

export interface IBlockSyncConfig {
  enabled?: boolean;
}

export interface IBlockSyncData<T> {
  blockId: TBlockId;
  data: T;
}
