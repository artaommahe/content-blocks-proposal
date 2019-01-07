import { IBlockAnswer } from '@skyeng/libs/blocks/base/model/interface';

export interface ISyncBlocksData {
  [ blockId: string ]: IBlockAnswer<any>[];
}

export interface IRtmEvent<T> {
  event: string;
  data: T;
}
