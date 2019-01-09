import { TScoreHandler } from '../../base/score/interface';
import { TInputData, TInputAnswerData } from '../interface';

export const inputWrongScoreHandler: TScoreHandler<TInputData, TInputAnswerData> = (score, answer, model) => {
  if (answer.isCorrect !== false) {
    return;
  }

  const correctAnswers = model!.getCorrectAnswers();

  return {
    ...score,
    wrong: score.wrong + (score.maxScore / correctAnswers.length),
  };
};
