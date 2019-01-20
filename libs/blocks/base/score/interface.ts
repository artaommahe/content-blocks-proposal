import { TBlockId } from '../interface';
import { BlockBaseModel } from '../model/base';
import { BlockScoreApi } from './service/score-api';
import { BlockConfig } from '../config/config';
import { IBlockAnswer } from '../model/interface';

export interface IBlockScoreConfig {
  enabled?: boolean;
  maxScore?: number;
}

export interface IBlockScoreStrategyConfig<TValue, TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>> {
  blockScoreApi: BlockScoreApi;
  blockId: TBlockId;
  blockConfig: BlockConfig;
  model?: BlockBaseModel<TValue, TAnswer>;
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

export type TScoreHandler<TValue = any, TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>> = (
  params: {
    score: IBlockScore;
    answer: TAnswer;
    model: BlockBaseModel<TValue, TAnswer>;
  }
) => IBlockScore | undefined;
