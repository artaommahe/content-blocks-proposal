import { sameScoreHandler } from '../handlers/same';
import { rightScoreHandler } from '../handlers/right';
import { wrongScoreHandler } from '../handlers/wrong';
import { BlockBaseScoreStrategy } from './base';

export class BlockSimpleScoreStrategy extends BlockBaseScoreStrategy {
  protected handlers = [
    sameScoreHandler,
    rightScoreHandler,
    wrongScoreHandler,
  ];
}
