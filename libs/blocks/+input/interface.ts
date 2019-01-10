import { IBlockAnswer } from '../base/model/interface';

export interface IInputAnswerData {
  isKeyUsed?: boolean;
}

export type TInputValue = string;
export type TInputAnswer = IBlockAnswer<TInputValue> & IInputAnswerData;
