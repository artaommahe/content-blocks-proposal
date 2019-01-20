import { TScoreHandler } from '../interface';

export const sameScoreHandler: TScoreHandler = ({ score, answer }) => {
  if (
    ((score.right + score.wrong) < score.maxScore)
    && (answer.isCorrect !== null)
  ) {
    return;
  }

  return score;
};
