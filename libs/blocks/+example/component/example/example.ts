import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, combineLatest, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sky-example',
  template: `
    <ng-content></ng-content>

    <sky-example-view [isCorrect]="isCorrect$ | async"
                      [value]="value$ | async"
                      (valueChange)="setValue($event)">
    </sky-example-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent implements OnInit {
  // ---> model part
  private correctAnswers = new BehaviorSubject<number[]>([]);
  private value = new BehaviorSubject<number>(0);

  public isCorrect$: Observable<boolean>;
  public value$ = this.value.asObservable();
  // <---

  constructor(
    //
  ) {
  }

  public ngOnInit() {
    const correctAnswers$ = this.correctAnswers.pipe(
      debounceTime(0),
    );

    this.isCorrect$ = this.value$.pipe(
      combineLatest(correctAnswers$),
      map(([ value, correctAnswers ]) => correctAnswers.includes(value)),
    );
  }

  // https://github.com/angular/angular/issues/22114
  @Input()
  public addCorrectAnswer = (correctAnswer: number): void => {
    this.correctAnswers.next([
      ...this.correctAnswers.getValue(),
      correctAnswer,
    ]);
  }

  public setValue(value: number): void {
    this.value.next(value);
  }
}
