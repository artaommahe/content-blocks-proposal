import { IBlockAnswer } from '../base/model/interface';
import { TScoreHandler } from '../base/score/interface';

export type TOrderWordAnswerValue = string[];
export type TOrderWordAnswer = IBlockAnswer<TOrderWordAnswerValue>;

export interface IOrderWordAnswerValueFormatted {
  id: string;
  isCorrect: boolean | null;
}
export interface IOrderWordAnswerFormatted extends TOrderWordAnswer {
  formattedValue: IOrderWordAnswerValueFormatted[];
}

export interface TOrderWordScoreHandlerParams {
  formattedAnswers: IOrderWordAnswerFormatted[];
  correctAnswer: string[];
}

export type TOrderWordScoreHandler = TScoreHandler<IOrderWordAnswerFormatted, TOrderWordScoreHandlerParams>;

export interface IOrderWordItem {
  id: string;
  text: string;
  contentNodes: Node[];
}

export interface IOrderWordFormattedItem extends IOrderWordItem {
  isCorrect: boolean | null;
}
