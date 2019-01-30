import { TInputValue, TInputAnswer } from '../interface';
import { InputModel } from './model';
import { IBlockScoreStrategyConfig, TSimpleScoreHandler } from '../../base/score/interface';
import { BlockSimpleScoreStrategy } from '../../base/score/strategy/simple';

export class InputScoreStrategy extends BlockSimpleScoreStrategy<InputModel> {
  constructor(
    config: IBlockScoreStrategyConfig<InputModel>,
  ) {
    super(config);

    this.handlers = [
      this.sameScoreHandler,
      this.inputKeyUsedScoreHandler,
      this.rightScoreHandler,
      this.inputWrongScoreHandler,
    ];
  }

  protected inputKeyUsedScoreHandler: TSimpleScoreHandler<TInputAnswer, TInputValue> = (score, answer) => {
    if (!answer.isKeyUsed) {
      return;
    }

    return {
      ...score,
      wrong: (score.maxScore - score.right),
    };
  }

  protected inputWrongScoreHandler: TSimpleScoreHandler<TInputAnswer, TInputValue> = (score, answer, { correctAnswers }) => {
    if (answer.isCorrect !== false) {
      return;
    }

    return {
      ...score,
      wrong: score.wrong + (score.maxScore / correctAnswers.length),
    };
  }
}
