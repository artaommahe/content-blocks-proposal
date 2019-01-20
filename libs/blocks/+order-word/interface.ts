import { IBlockAnswer } from '../base/model/interface';

export type TOrderWordValue = string[];
export type TOrderWordAnswer = IBlockAnswer<TOrderWordValue>;

export interface IOrderWordAnswerValueFormatted {
  id: string;
  isCorrect: boolean | null;
}
export type TOrderWordAnswerFormatted = IBlockAnswer<IOrderWordAnswerValueFormatted[]>;

export interface IOrderWordItem {
  id: string;
  text: string;
  contentNodes: Node[];
}

export interface IOrderWordFormattedItem extends IOrderWordItem {
  isCorrect: boolean | null;
}
