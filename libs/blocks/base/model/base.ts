import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, skip, debounceTime, take, mapTo } from 'rxjs/operators';
import { IBlockAnswer } from './interface';

export class BlockBaseModel<TValue, TAnswer extends IBlockAnswer<TValue> = IBlockAnswer<TValue>> {
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

  public addAnswer(answerPart: Partial<TAnswer>): void {
    const currentAnswer = this.getCurrentAnswer();

    if (currentAnswer
      && (answerPart.value === currentAnswer.value)
      && (currentAnswer.isCorrect !== null)) {
      return;
    }

    const answer = this.createAnswer(answerPart);

    this.answers.next([
      ...this.answers.getValue(),
      answer,
    ]);

    this.newAnswer.next(answer);
  }

  public setAnswers(newAnswers: TAnswer[] | null): void {
    const answers = this.answers.getValue();

    if ((!newAnswers || !newAnswers.length) && !answers.length) {
      return;
    }

    this.answers.next(newAnswers || []);
  }

  public getCorrectAnswers(): TValue[] {
    return this.correctAnswers.getValue();
  }

  public getCurrentAnswer(): TAnswer | undefined {
    const answers = this.answers.getValue();

    return answers.length
      ? answers[answers.length - 1]
      : undefined;
  }

  private createAnswer(answer: Partial<TAnswer>): TAnswer {
    const isCorrect = answer.isCorrect !== undefined
      ? answer.isCorrect
      : this.isCorrect(answer.value);

    return <TAnswer> {
      // https://github.com/Microsoft/TypeScript/issues/10727
      ...((<Object> answer) || {}),
      createdAt: Date.now(),
      isCorrect,
    };
  }

  private isCorrect(value?: TValue): boolean {
    const correctAnswers = this.getCorrectAnswers();

    return !!value && correctAnswers.includes(value);
  }
}
