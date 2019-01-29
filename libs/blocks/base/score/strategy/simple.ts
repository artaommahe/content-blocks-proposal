import { BlockBaseScoreStrategy } from './base';
import { IBlockAnswer } from '../../model/interface';
import { BlockBaseModel } from '../../model/base';
import { IBlockScoreStrategyConfig, ISimpleScoreHandlerParams, TSimpleScoreHandler } from '../interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class BlockSimpleScoreStrategy<
  TValue,
  TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>,
  TModel extends BlockBaseModel<TValue, TAnswer> = BlockBaseModel<TValue, TAnswer>,
> extends BlockBaseScoreStrategy<TValue, TAnswer, TModel, TAnswer, ISimpleScoreHandlerParams<TValue>> {
  constructor(
    config: IBlockScoreStrategyConfig<TValue, TAnswer, TModel>,
  ) {
    super(config);

    this.handlers = [
      this.sameScoreHandler,
      this.rightScoreHandler,
      this.wrongScoreHandler,
    ];
  }

  protected getScoreHandlerParams(model: TModel): Observable<ISimpleScoreHandlerParams<TValue>> {
    return model.correctAnswers$.pipe(
      map(correctAnswers => ({ correctAnswers }))
    );
  }

  protected sameScoreHandler: TSimpleScoreHandler<TAnswer, TValue> = (score, answer) => {
    if (
      ((score.right + score.wrong) < score.maxScore)
      && (answer.isCorrect !== null)
    ) {
      return;
    }

    return score;
  }

  protected rightScoreHandler: TSimpleScoreHandler<TAnswer, TValue> = (score, answer) => {
    if (answer.isCorrect !== true) {
      return;
    }

    return {
      ...score,
      right: score.right + (score.maxScore - score.wrong),
    };
  }

  protected wrongScoreHandler: TSimpleScoreHandler<TAnswer, TValue> = (score, answer, { correctAnswers }) => {
    if (answer.isCorrect !== false) {
      return;
    }

    return {
      ...score,
      wrong: score.wrong + (score.maxScore / (correctAnswers.length - 1)),
    };
  }
}
