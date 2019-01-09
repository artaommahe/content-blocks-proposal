import { IBlockAnswer, IBlockAnswerWithKey } from '../base/model/interface';

export type TInputData = string;
export type TInputAnswerData = IBlockAnswerWithKey;
export type TInputAnswer = IBlockAnswer<TInputData> & TInputAnswerData;
