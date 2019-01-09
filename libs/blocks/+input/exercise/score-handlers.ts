import { TScoreHandler } from '../../base/score/interface';
import { TInputData, TInputAnswerData } from '../interface';
import { sameScoreHandler } from '../../base/score/handlers/same';
import { rightScoreHandler } from '../../base/score/handlers/right';
import { keyUsedScoreHandler } from '../../base/score/handlers/key';
import { inputWrongScoreHandler } from './wrong-score-handler';

export const INPUT_SCORE_HANDLERS: TScoreHandler<TInputData, TInputAnswerData>[] = [
  sameScoreHandler,
  keyUsedScoreHandler,
  rightScoreHandler,
  inputWrongScoreHandler,
];
