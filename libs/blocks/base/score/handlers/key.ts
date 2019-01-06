import { TScoreHandler } from '../interface';
import { IBlockAnswer, IBlockAnswerWithKey } from '../../model/interface';

type TAnswerWithKey = IBlockAnswer<any> & IBlockAnswerWithKey;

export const handleKeyUsedScore: TScoreHandler<TAnswerWithKey> = (score, answer) => {
  if (!answer.isKeyUsed) {
    return;
  }

  return {
    ...score,
    wrong: (score.maxScore - score.right),
  };
};
