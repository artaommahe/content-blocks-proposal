import { IBlockAnswer } from '@skyeng/libs/blocks/base/model/interface';

export interface ISyncData {
  [ blockId: string ]: IBlockAnswer<any>[];
}
