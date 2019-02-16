import { IBlockAnswer } from '../base/model/interface';
import { TScoreHandler } from '../base/score/interface';

export type TDndGroupDragId = string;
export type TDndGroupDropId = string;

export type TDndGroupAnswerValue = Record<TDndGroupDragId, TDndGroupDropId | null>;
export type TDndGroupAnswer = IBlockAnswer<TDndGroupAnswerValue>;

export interface IDndGroupDragItem {
  id: TDndGroupDragId;
  text: string;
  contentNodes: Node[];
}

export interface IDndGroupDropItem {
  id: TDndGroupDropId;
  dragIds: TDndGroupDragId[];
  text: string;
  contentNodes: Node[];
}

export interface IDndGroupAnswerValueFormatted {
  dropId: TDndGroupDropId | null;
  isCorrect: boolean | null;
}

export interface IDndGroupAnswerFormatted extends TDndGroupAnswer {
  formattedValue: Record<TDndGroupDragId, IDndGroupAnswerValueFormatted>;
}

export interface IDndGroupDragItemFormatted extends IDndGroupDragItem {
  currentDropId: TDndGroupDropId | null;
  isCorrect: boolean | null;
  score: IDndGroupDragScore;
}

export interface IDndGroupDropItemFormatted extends IDndGroupDropItem {
  currentDrags: IDndGroupDragItemFormatted[];
}

export interface IDropData {
  draggingId: TDndGroupDragId;
  dropItem: IDndGroupDropItemFormatted;
}

export interface IDndGroupScoreHandlerParams {
  correctAnswer: TDndGroupAnswerValue;
  answers: TDndGroupAnswer[];
}

export type TDndGroupScoreHandler = TScoreHandler<TDndGroupAnswer, IDndGroupScoreHandlerParams>;

export interface IDndGroupDragScore {
  right: number;
  wrong: number;
}

export type TDndGroupDragsScore = Record<TDndGroupDragId, IDndGroupDragScore>;
