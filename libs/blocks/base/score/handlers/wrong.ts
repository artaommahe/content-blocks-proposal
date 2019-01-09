import { TScoreHandler } from '../interface';

export const wrongScoreHandler: TScoreHandler = (score, answer, model) => {
  if (answer.isCorrect !== false) {
    return;
  }

  const correctAnswers = model!.getCorrectAnswers();

  return {
    ...score,
    wrong: score.wrong + (score.maxScore / (correctAnswers.length - 1)),
  };
};
