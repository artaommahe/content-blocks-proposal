import { TScoreHandler } from '../interface';
import { IBlockAnswerWithKey } from '../../model/interface';

export const keyUsedScoreHandler: TScoreHandler<any, IBlockAnswerWithKey> = (score, answer) => {
  if (!answer.isKeyUsed) {
    return;
  }

  return {
    ...score,
    wrong: (score.maxScore - score.right),
  };
};
