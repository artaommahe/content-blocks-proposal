import { TScoreHandler } from '../../base/score/interface';
import { TInputValue, TInputAnswer } from '../interface';

export const inputWrongScoreHandler: TScoreHandler<TInputValue, TInputAnswer> = ({ score, answer, model }) => {
  if (answer.isCorrect !== false) {
    return;
  }

  const correctAnswers = model!.getCorrectAnswers();

  return {
    ...score,
    wrong: score.wrong + (score.maxScore / correctAnswers.length),
  };
};
