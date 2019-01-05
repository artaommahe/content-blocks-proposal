import { TBlockId } from '../interface';
import { BlockBaseModel } from '../model/base';
import { BlockScoreApi } from './service/score-api';
import { BlockConfig } from '../config/config';

export interface IBlockScoreConfig {
  enabled?: boolean;
  maxScore?: number;
}

export interface IBlockScoreStrategyConfig {
  blockScoreApi: BlockScoreApi;
  blockId: TBlockId;
  blockConfig: BlockConfig;
  model?: BlockBaseModel<any, any>;
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
