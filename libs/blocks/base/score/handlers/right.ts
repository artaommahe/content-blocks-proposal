import { TScoreHandler } from '../interface';

export const rightScoreHandler: TScoreHandler = ({ score, answer }) => {
  if (answer.isCorrect !== true) {
    return;
  }

  return {
    ...score,
    right: score.right + (score.maxScore - score.wrong),
  };
};
