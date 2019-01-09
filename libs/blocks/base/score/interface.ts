import { TBlockId } from '../interface';
import { BlockBaseModel } from '../model/base';
import { BlockScoreApi } from './service/score-api';
import { BlockConfig } from '../config/config';
import { IBlockAnswer } from '../model/interface';

export interface IBlockScoreConfig {
  enabled?: boolean;
  maxScore?: number;
}

export interface IBlockScoreStrategyConfig<
  TValue,
  TAnswerData extends Object = {},
  TAnswer extends IBlockAnswer<TValue> & TAnswerData = IBlockAnswer<TValue> & TAnswerData,
> {
  blockScoreApi: BlockScoreApi;
  blockId: TBlockId;
  blockConfig: BlockConfig;
  model?: BlockBaseModel<TValue, TAnswerData>;
  handlers?: TScoreHandler<TValue, TAnswerData, TAnswer>[];
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

export type TScoreHandler<
  TValue = any,
  TAnswerData extends Object = any,
  TAnswer extends IBlockAnswer<TValue> & TAnswerData = IBlockAnswer<TValue> & TAnswerData,
> = (
  score: IBlockScore,
  answer: TAnswer,
  model: BlockBaseModel<TValue, TAnswerData, TAnswer>,
) => IBlockScore | undefined;
