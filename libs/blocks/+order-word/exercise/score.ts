import { BlockBaseScoreStrategy } from '../../base/score/strategy/base';
import { TScoreHandler, IBlockScoreStrategyConfig } from '../../base/score/interface';
import { TOrderWordValue } from '../interface';
import { addIsCorrectToItems } from '../helpers';

interface IScoreMetadata {
  fails: { [ index: number ]: string[] };
}

interface IAnswerItemWithIsCorrect {
  id: string;
  isCorrect: boolean | null;
}

interface IAnswerItemsIsCorrectDiff {
  startingIndex: number;
  changedItems: IAnswerItemWithIsCorrect[];
}

export class OrderWordScoreStrategy extends BlockBaseScoreStrategy {
  // TODO: clear on reset
  private scoreMetadata: IScoreMetadata = {
    fails: {},
  };

  constructor(
    config: IBlockScoreStrategyConfig<any, any>,
  ) {
    super(config);

    this.handlers = [
      this.orderWordScoreHandler,
    ];
  }

  private orderWordScoreHandler: TScoreHandler<TOrderWordValue> = ({ score, model, answer }) => {
    const answers = model.getAnswers();
    const correctAnswer = model.getCorrectAnswers()[0];
    const answerIndex = answers.indexOf(answer);

    // TODO: use items with isCorrect
    const answersItemsWithIsCorrect: IAnswerItemWithIsCorrect[][] = answers.map((answer, index) =>
      addIsCorrectToItems(
        answer.value.map(id => ({ id })),
        answers.slice(0, index + 1),
        correctAnswer
      )
    );

    /**
     * есть S=1 балл, он делится на N где,
     * N это количество возможных ответов (N = M-2, где M - всего элементов,
     * 2 это текущий, который на первом месте и правильный, который сейчас где-то там).
     * Неправильный ответ отнимает S/N, правильный - прибавляет S/N
     * После того, как дан ответ, у нас осталось N2 = N-1 элементов для выбора,
     * и какое-то кол-во баллов S2, ну и применяем тот же алгоритм (edited)
     */
    const currentAnswer = answersItemsWithIsCorrect[answerIndex];
    const previousAnswer = answersItemsWithIsCorrect[answerIndex - 1];
    const diff = this.getIsCorrectDiff(currentAnswer, previousAnswer);

    diff.changedItems.forEach((item, changedItemIndex) => {
      const itemIndex = diff.startingIndex + changedItemIndex;
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

  private getIsCorrectDiff(current: IAnswerItemWithIsCorrect[], previous?: IAnswerItemWithIsCorrect[]): IAnswerItemsIsCorrectDiff {
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
