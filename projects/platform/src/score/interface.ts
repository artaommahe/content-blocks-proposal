import { IBlockScoreSet, IBlockScoreRemove, IBlockScore } from '@skyeng/libs/blocks/base/score/interface';
import { BLOCK_SCORE_EVENT } from '@skyeng/libs/blocks/base/score/const';

export interface IScore {
  right: number;
  wrong: number;
  total: number;
}

export interface IScores {
  [ blockId: string ]: IBlockScore;
}

export interface IScoreSetEvent {
  event: BLOCK_SCORE_EVENT.set;
  data: IBlockScoreSet;
}

export interface IScoreRemoveEvent {
  event: BLOCK_SCORE_EVENT.remove;
  data: IBlockScoreRemove;
}

export type TScoreEvent = IScoreSetEvent | IScoreRemoveEvent;
