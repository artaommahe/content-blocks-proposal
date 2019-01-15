import { sameScoreHandler } from '../../base/score/handlers/same';
import { rightScoreHandler } from '../../base/score/handlers/right';
import { inputWrongScoreHandler } from './wrong-score-handler';
import { inputKeyUsedScoreHandler } from './key-score-handler';
import { BlockBaseScoreStrategy } from '../../base/score/strategy/base';

export class InputScoreStrategy extends BlockBaseScoreStrategy {
  protected handlers = [
    sameScoreHandler,
    inputKeyUsedScoreHandler,
    rightScoreHandler,
    inputWrongScoreHandler,
  ];
}
