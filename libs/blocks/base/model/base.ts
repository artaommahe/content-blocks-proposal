import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, skip, debounceTime, take, mapTo } from 'rxjs/operators';
import { IBlockAnswer } from './interface';
import { getStreamValue } from '@skyeng/libs/base/helpers';

export class BlockBaseModel<
  TValue,
  TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>,
  TAnswerData extends Object = {}
> {
  private answers = new BehaviorSubject<TAnswer[]>([]);
  private correctAnswers = new BehaviorSubject<TValue[]>([]);
  private newAnswer = new Subject<TAnswer>();

  public answers$ = this.answers.asObservable();
  public correctAnswers$ = this.correctAnswers.asObservable();
  public correctAnswersInited$: Observable<void>;
  public currentAnswer$: Observable<TAnswer | undefined>;
  public newAnswer$ = this.newAnswer.asObservable();

  constructor(
  ) {
    this.currentAnswer$ = this.answers.asObservable().pipe(
      map(answers => answers[answers.length - 1]),
    );

    this.correctAnswersInited$ = this.correctAnswers$.pipe(
      skip(1),
      debounceTime(0),
      take(1),
      mapTo(undefined),
    );
  }

  public addCorrectAnswer(correctAnswer: TValue): void {
    this.correctAnswers.next([
      ...this.correctAnswers.getValue(),
      correctAnswer,
    ]);
  }

  public addAnswer(value: TValue, data?: TAnswerData): void {
    const currentValue = getStreamValue(this.currentAnswer$);

    if (currentValue && (value === currentValue.value)) {
      return;
    }

    const answer = this.createAnswer(value, data);

    this.answers.next([
      ...this.answers.getValue(),
      answer,
    ]);

    this.newAnswer.next(answer);
  }

  public setAnswers(answers: TAnswer[]): void {
    this.answers.next(answers);
  }

  private createAnswer(value: TValue, data?: TAnswerData): TAnswer {
    return <TAnswer> {
      value,
      createdAt: Date.now(),
      isCorrect: this.isCorrect(value),
      // https://github.com/Microsoft/TypeScript/issues/10727
      ...((<Object> data) || {})
    };
  }

  private isCorrect(value: TValue): boolean {
    const correctAnswers = this.correctAnswers.getValue();

    return correctAnswers.includes(value);
  }
}
