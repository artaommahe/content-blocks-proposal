import { BaseBlockApi } from '../../base/service/block-api';
import { TOrderWordValue, TOrderWordAnswerFormatted, TOrderWordAnswer } from '../interface';
import { Observable } from 'rxjs';
import { map, withLatestFrom, publishReplay, refCount } from 'rxjs/operators';

export class OrderWordBlockApi extends BaseBlockApi<TOrderWordValue> {
  public currentAnswer$: Observable<TOrderWordAnswerFormatted | undefined>;
  public formattedAnswers$: Observable<TOrderWordAnswerFormatted[]>;

  public init(): void {
    super.init();

    const correctAnswer$ = this.model.correctAnswers$.pipe(
      map(correctAnswers => correctAnswers[0]),
    );

    this.formattedAnswers$ = this.model.answers$.pipe(
      withLatestFrom(correctAnswer$),
      map(([ answers, correctAnswer ]) => this.formatAnswers(answers, correctAnswer)),
      publishReplay(1),
      refCount(),
    );

    this.currentAnswer$ = this.formattedAnswers$.pipe(
      map(answers => answers[answers.length - 1]),
    );
  }

  private formatAnswers(
    answers: TOrderWordAnswer[],
    correctAnswer: string[]
  ): TOrderWordAnswerFormatted[] {
    return answers.map((answer, answerIndex) => {
      const previousAnswerValue = answers[answerIndex - 1] ? answers[answerIndex - 1].value : null;

      let hasWrongItem = false;
      let newCorrectWasSet = false;
      let lastCorrectIndex = -1;

      // adding isCorrect to values
      const value = answer.value.map((id, index) => {
        let isCorrect: boolean | null = null;

        if (
          !hasWrongItem
          && (index === correctAnswer.indexOf(id))
          && (index - lastCorrectIndex === 1)
        ) {
          isCorrect = true;
          lastCorrectIndex = index;

          if (!previousAnswerValue || (index !== previousAnswerValue.indexOf(id))) {
            newCorrectWasSet = true;
          }
        }
        else if (
          !hasWrongItem
          && !newCorrectWasSet
          && (index !== correctAnswer.indexOf(id))
        ) {
          isCorrect = false;
          hasWrongItem = true;
        }

        return { id, isCorrect };
      });

      return { ...answer, value };
    });
  }
}
