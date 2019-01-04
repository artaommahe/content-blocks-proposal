import { BehaviorSubject, Observable } from 'rxjs';
import { withLatestFrom, map, skip, debounceTime, take, mapTo } from 'rxjs/operators';

export class BlockBaseModel<T> {
  private correctAnswers = new BehaviorSubject<T[]>([]);
  private value: BehaviorSubject<T>;

  public answersInited$: Observable<void>;
  public correctAnswers$ = this.correctAnswers.asObservable();
  public isCorrect$: Observable<boolean | null>;
  public value$: Observable<T>;

  constructor(
    initialValue: T,
  ) {
    this.value = new BehaviorSubject<T>(initialValue);
    this.value$ = this.value.asObservable();

    this.isCorrect$ = this.value$.pipe(
      withLatestFrom(this.correctAnswers),
      map(([ value, correctAnswers ]) =>
        value ? correctAnswers.includes(value) : null
      ),
    );

    this.answersInited$ = this.correctAnswers$.pipe(
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

  public setValue(value: T): void {
    if (value === this.value.getValue()) {
      return;
    }

    this.value.next(value);
  }
}