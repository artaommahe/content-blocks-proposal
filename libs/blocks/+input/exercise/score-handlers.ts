import { sameScoreHandler } from '../../base/score/handlers/same';
import { rightScoreHandler } from '../../base/score/handlers/right';
import { inputWrongScoreHandler } from './wrong-score-handler';
import { inputKeyUsedScoreHandler } from './key-score-handler';

export const INPUT_SCORE_HANDLERS = [
  sameScoreHandler,
  inputKeyUsedScoreHandler,
  rightScoreHandler,
  inputWrongScoreHandler,
];
