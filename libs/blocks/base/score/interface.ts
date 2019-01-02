import { TBlockId } from '../interface';

export class IBlockScoreConfig {
  enabled?: boolean;
  maxScore?: number;
}

export interface IBlockScore {
  // [ 0, maxScore ]
  right: number;
  // [ 0, maxScore ]
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
