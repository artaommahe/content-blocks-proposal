import { TBlockId } from '../interface';

export interface IBlockScore {
  // [ 0, 1 ]
  right: number;
  // [ 0, 1 ]
  wrong: number;
  maxScore: number;
}

export interface IBlockScoreSet {
  blockId: TBlockId;
  score: IBlockScore;
}

export interface IBlockScoreRemove {
  blockId: TBlockId;
}
