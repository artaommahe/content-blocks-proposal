import { BlockBaseModel } from '../../base/model/base';
import {
  TDndGroupAnswerValue, IDndGroupAnswerFormatted, TDndGroupAnswer,
  IDndGroupAnswerValueFormatted, TDndGroupDragId
} from '../interface';
import { Observable } from 'rxjs';
import { map, withLatestFrom, publishReplay, refCount } from 'rxjs/operators';

export class DndGroupModel extends BlockBaseModel<TDndGroupAnswerValue> {
  public currentFormattedAnswer$: Observable<IDndGroupAnswerFormatted | undefined>;
  public formattedAnswers$: Observable<IDndGroupAnswerFormatted[]>;

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

  private formatAnswers(answers: TDndGroupAnswer[], correctAnswer: TDndGroupAnswerValue): IDndGroupAnswerFormatted[] {
    return answers.map(answer => {
      const formattedValue = Object.keys(answer.value)
        .reduce<Record<TDndGroupDragId, IDndGroupAnswerValueFormatted>>(
          (value, dragId) => ({
            ...value,
            [ dragId ]: {
              isCorrect: answer.value[dragId]
                ? answer.value[dragId] === correctAnswer[dragId]
                : null,
              dropId: answer.value[dragId],
            }
          }),
          {}
        );

      return { ...answer, formattedValue };
    });
  }
}
