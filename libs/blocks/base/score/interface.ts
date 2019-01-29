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
  TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>,
  TModel extends BlockBaseModel<TValue, TAnswer> = BlockBaseModel<TValue, TAnswer>
> {
  blockScoreApi: BlockScoreApi;
  blockId: TBlockId;
  blockConfig: BlockConfig;
  model?: TModel;
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

export type TScoreHandler<THandlerAnswer, TParams = void> =
  (score: IBlockScore, answer: THandlerAnswer, params: TParams) => IBlockScore | undefined;

export interface ISimpleScoreHandlerParams<TValue> {
  correctAnswers: TValue[];
}

export type TSimpleScoreHandler<TAnswer, TValue> = TScoreHandler<TAnswer, ISimpleScoreHandlerParams<TValue>>;
