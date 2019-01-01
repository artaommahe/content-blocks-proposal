import { TBlockId } from '../interface';

export interface IBlockSyncData<T> {
  blockId: TBlockId;
  data: T;
}
