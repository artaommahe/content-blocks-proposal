import { BlockBaseScoreStrategy } from '../../base/score/strategy/base';
import { IBlockScoreStrategyConfig } from '../../base/score/interface';
import {
  TOrderWordValue, TOrderWordAnswer, IOrderWordAnswerValueFormatted,
  IOrderWordAnswerFormatted, TOrderWordScoreHandlerParams, TOrderWordScoreHandler
} from '../interface';
import { OrderWordModel } from './model';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface IScoreMetadata {
  fails: { [ index: number ]: string[] };
}

interface IAnswerItemsIsCorrectDiff {
  startingIndex: number;
  changedItems: IOrderWordAnswerValueFormatted[];
}

export class OrderWordScoreStrategy extends BlockBaseScoreStrategy<
  TOrderWordValue, TOrderWordAnswer, OrderWordModel, IOrderWordAnswerFormatted, TOrderWordScoreHandlerParams
> {
  private scoreMetadata: IScoreMetadata = {
    fails: {},
  };

  constructor(
    config: IBlockScoreStrategyConfig<TOrderWordValue, TOrderWordAnswer, OrderWordModel>,
  ) {
    super(config);

    this.handlers = [
      this.orderWordScoreHandler,
    ];
  }

  protected reset(): void {
    super.reset();

    this.scoreMetadata = {
      fails: {}
    };
  }

  protected getScoreAnswers(model: OrderWordModel): Observable<IOrderWordAnswerFormatted[]> {
    return model.formattedAnswers$;
  }

  protected getScoreHandlerParams(model: OrderWordModel): Observable<TOrderWordScoreHandlerParams> {
    const correctAnswer$ = model.correctAnswers$.pipe(
      map(correctAnwers => correctAnwers[0]),
    );

    return combineLatest(model.formattedAnswers$, correctAnswer$).pipe(
      map(([ formattedAnswers, correctAnswer ]) => ({ formattedAnswers, correctAnswer })),
    );
  }

  private orderWordScoreHandler: TOrderWordScoreHandler = (
    score,
    answer,
    { formattedAnswers, correctAnswer }
  ) => {
    const answerIndex = formattedAnswers.findIndex(({ createdAt }) => createdAt === answer.createdAt);
    const prevAnswerItems = formattedAnswers[answerIndex - 1]
      ? formattedAnswers[answerIndex - 1].formattedValue
      : undefined;

    /**
     * есть S=1 балл, он делится на N где,
     * N это количество возможных ответов (N = M-2, где M - всего элементов,
     * 2 это текущий, который на первом месте и правильный, который сейчас где-то там).
     * Неправильный ответ отнимает S/N, правильный - прибавляет S/N
     * После того, как дан ответ, у нас осталось N2 = N-1 элементов для выбора,
     * и какое-то кол-во баллов S2, ну и применяем тот же алгоритм (edited)
     */
    // Score: right 3.04 | wrong 6.96 | remaining 0
    const { changedItems, startingIndex } = this.getItemsDiff(answer.formattedValue, prevAnswerItems);

    changedItems.forEach((item, changedItemIndex) => {
      const itemIndex = startingIndex + changedItemIndex;
      const indexFails = this.scoreMetadata.fails[itemIndex] || [];
      const remainingScore = score.maxScore - score.wrong - score.right;
      const remainigAnswers = correctAnswer.length - itemIndex - indexFails.length;
      const answerScore = remainingScore / remainigAnswers;

      if (item.isCorrect) {
        score = {
          ...score,
          right: score.right + answerScore,
        };
      }
      // ignore repeated fails
      else if (!indexFails.includes(item.id)) {
        score = {
          ...score,
          wrong: score.wrong + answerScore,
        };

        this.scoreMetadata.fails[itemIndex] = [ ...indexFails, item.id ];
      }
    });

    return score;
  }

  private getItemsDiff(
    current: IOrderWordAnswerValueFormatted[],
    previous?: IOrderWordAnswerValueFormatted[]
  ): IAnswerItemsIsCorrectDiff {
    let startingIndex = -1;

    const changedItems = current.filter((item, index) => {
      const previousItem = previous ? previous[index] : undefined;

      if (
        (item.isCorrect === null)
        || (
          previousItem
          && (item.id === previousItem.id)
          && (item.isCorrect === previousItem.isCorrect)
        )
      ) {
        return false;
      }

      if (startingIndex === -1) {
        startingIndex = index;
      }

      return true;
    });

    return { startingIndex, changedItems };
  }
}
