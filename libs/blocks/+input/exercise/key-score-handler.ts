import { TInputAnswer, TInputValue } from '../interface';
import { TScoreHandler } from '../../base/score/interface';

export const inputKeyUsedScoreHandler: TScoreHandler<TInputValue, TInputAnswer> = ({ score, answer }) => {
  if (!answer.isKeyUsed) {
    return;
  }

  return {
    ...score,
    wrong: (score.maxScore - score.right),
  };
};
