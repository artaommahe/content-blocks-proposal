import { Component, ChangeDetectionStrategy, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'sky-example',
  template: `
    <slot></slot>

    <sky-example-view [isCorrect]="isCorrect$ | async"
                      [value]="value$ | async"
                      (valueChange)="setValue($event)">
    </sky-example-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class ExampleComponent implements OnInit {
  // ---> model part
  private correctAnswers: number[] = [];
  private value = new BehaviorSubject<number>(0);

  public isCorrect$: Observable<boolean>;
  public value$ = this.value.asObservable();
  // <---

  constructor(
    //
  ) {
  }

  public ngOnInit() {
    this.isCorrect$ = this.value$.pipe(
      map(value => this.correctAnswers.includes(value)),
    );
  }

  @Input()
  public addCorrectAnswer = (correctAnswer: number): void => {
    this.correctAnswers = [
      ...this.correctAnswers,
      correctAnswer,
    ];
  }

  public setValue(value: number): void {
    this.value.next(value);
  }
}
