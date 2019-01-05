import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, skip, debounceTime, take, mapTo } from 'rxjs/operators';
import { IBlockAnswer } from './interface';
import { getStreamValue } from '@skyeng/libs/base/helpers';

export class BlockBaseModel<T> {
  private answers = new BehaviorSubject<IBlockAnswer<T>[]>([]);
  private correctAnswers = new BehaviorSubject<T[]>([]);
  private newAnswer = new Subject<IBlockAnswer<T>>();

  public answers$ = this.answers.asObservable();
  public correctAnswers$ = this.correctAnswers.asObservable();
  public correctAnswersInited$: Observable<void>;
  public currentAnswer$: Observable<IBlockAnswer<T> | undefined>;
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

  public addCorrectAnswer(correctAnswer: T): void {
    this.correctAnswers.next([
      ...this.correctAnswers.getValue(),
      correctAnswer,
    ]);
  }

  public addAnswer(value: T): void {
    const currentValue = getStreamValue(this.currentAnswer$);

    if (currentValue && (value === currentValue.value)) {
      return;
    }

    const answer = this.createAnswer(value);

    this.answers.next([
      ...this.answers.getValue(),
      answer,
    ]);

    this.newAnswer.next(answer);
  }

  public setAnswers(answers: IBlockAnswer<T>[]): void {
    this.answers.next(answers);
  }

  private createAnswer(value: T): IBlockAnswer<T> {
    return {
      value,
      createdAt: Date.now(),
      isCorrect: this.isCorrect(value),
    };
  }

  private isCorrect(value: T): boolean {
    const correctAnswers = this.correctAnswers.getValue();

    return correctAnswers.includes(value);
  }
}
