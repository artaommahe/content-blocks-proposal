import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, skip, debounceTime, take, mapTo } from 'rxjs/operators';
import { IBlockAnswer } from './interface';

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

  public addAnswer(answerPart: Partial<TAnswer> & TAnswerData): void {
    const currentAnswer = this.getCurrentAnswer();

    if (currentAnswer && (answerPart.value === currentAnswer.value)) {
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

    return answers[0];
  }

  private createAnswer(answer: Partial<TAnswer> & TAnswerData): TAnswer {
    return <TAnswer> {
      createdAt: Date.now(),
      isCorrect: this.isCorrect(answer.value),
      // https://github.com/Microsoft/TypeScript/issues/10727
      ...((<Object> answer) || {})
    };
  }

  private isCorrect(value?: TValue): boolean {
    const correctAnswers = this.getCorrectAnswers();

    return !!value && correctAnswers.includes(value);
  }
}
