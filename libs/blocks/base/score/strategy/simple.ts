import { BlockBaseScoreStrategy } from './base';
import { IBlockAnswer } from '../../model/interface';
import { BlockBaseModel } from '../../model/base';
import { IBlockScoreStrategyConfig, ISimpleScoreHandlerParams, TSimpleScoreHandler } from '../interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class BlockSimpleScoreStrategy<
  TModel extends BlockBaseModel<any, any> = BlockBaseModel<any, any>,
> extends BlockBaseScoreStrategy<TModel, IBlockAnswer<any>, ISimpleScoreHandlerParams<any>> {
  constructor(
    config: IBlockScoreStrategyConfig<TModel>,
  ) {
    super(config);

    this.handlers = [
      this.sameScoreHandler,
      this.rightScoreHandler,
      this.wrongScoreHandler,
    ];
  }

  protected getScoreHandlerParams(model: TModel): Observable<ISimpleScoreHandlerParams<any>> {
    return model.correctAnswers$.pipe(
      map(correctAnswers => ({ correctAnswers }))
    );
  }

  protected sameScoreHandler: TSimpleScoreHandler<IBlockAnswer<any>, any> = (score, answer) => {
    if (
      ((score.right + score.wrong) < score.maxScore)
      && (answer.isCorrect !== null)
    ) {
      return;
    }

    return score;
  }

  protected rightScoreHandler: TSimpleScoreHandler<IBlockAnswer<any>, any> = (score, answer) => {
    if (answer.isCorrect !== true) {
      return;
    }

    return {
      ...score,
      right: score.right + (score.maxScore - score.wrong),
    };
  }

  protected wrongScoreHandler: TSimpleScoreHandler<IBlockAnswer<any>, any> = (score, answer, { correctAnswers }) => {
    if (answer.isCorrect !== false) {
      return;
    }

    return {
      ...score,
      wrong: score.wrong + (score.maxScore / (correctAnswers.length - 1)),
    };
  }
}
