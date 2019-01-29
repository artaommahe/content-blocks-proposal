import { BlockBaseModel } from '../../base/model/base';
import { TOrderWordValue, IOrderWordAnswerFormatted, TOrderWordAnswer } from '../interface';
import { Observable } from 'rxjs';
import { map, withLatestFrom, publishReplay, refCount } from 'rxjs/operators';

export class OrderWordModel extends BlockBaseModel<TOrderWordValue> {
  public currentFormattedAnswer$: Observable<IOrderWordAnswerFormatted | undefined>;
  public formattedAnswers$: Observable<IOrderWordAnswerFormatted[]>;

  constructor() {
    super();

    const correctAnswer$ = this.correctAnswers$.pipe(
      map(correctAnswers => correctAnswers[0]),
    );

    this.formattedAnswers$ = this.answers$.pipe(
      withLatestFrom(correctAnswer$),
      map(([ answers, correctAnswer ]) => this.formatAnswers(answers, correctAnswer)),
      publishReplay(1),
      refCount(),
    );

    this.currentFormattedAnswer$ = this.formattedAnswers$.pipe(
      map(answers => answers[answers.length - 1]),
    );
  }

  private formatAnswers(answers: TOrderWordAnswer[], correctAnswer: string[]): IOrderWordAnswerFormatted[] {
    return answers.map((answer, answerIndex) => {
      const previousAnswerValue = answers[answerIndex - 1] ? answers[answerIndex - 1].value : null;

      let hasWrongItem = false;
      let newCorrectWasSet = false;
      let lastCorrectIndex = -1;

      // adding isCorrect to values
      const formattedValue = answer.value.map((id, index) => {
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

      return { ...answer, formattedValue };
    });
  }
}
