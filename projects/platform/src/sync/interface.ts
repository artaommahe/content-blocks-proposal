import { IAnswer } from '@skyeng/libs/blocks/base/model/interface';

export interface ISyncData {
  [ blockId: string ]: IAnswer<any>[];
}
