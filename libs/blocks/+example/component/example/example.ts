import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, combineLatest, debounceTime, takeUntil } from 'rxjs/operators';
import { BlockApi } from '@skyeng/libs/blocks/base/service/block-api';
import { BlockService } from '@skyeng/libs/blocks/base/service/block';
import { TExampleData } from '../../interface';

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
export class ExampleComponent implements OnInit, OnDestroy {
  @Input() id: string;

  // ---> MODEL PART
  private correctAnswers = new BehaviorSubject<number[]>([]);
  private value = new BehaviorSubject<TExampleData>(0);

  public isCorrect$: Observable<boolean>;
  public value$ = this.value.asObservable();
  // <---

  private blockApi: BlockApi<TExampleData>;
  private destroyed = new Subject<void>();

  constructor(
    private blockService: BlockService,
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

    this.blockApi = this.blockService.createApi<TExampleData>({
      id: this.id,
      sync: {
        enabled: true,
      },
    });

    this.blockApi.syncOnData()
      .pipe(
        takeUntil(this.destroyed),
      )
      .subscribe(value => this.setValue(value, false));
  }

  public ngOnDestroy() {
    this.blockApi.destroy();
    this.destroyed.next();
    this.destroyed.complete();
  }

  // https://github.com/angular/angular/issues/22114
  @Input()
  public addCorrectAnswer = (correctAnswer: number): void => {
    this.correctAnswers.next([
      ...this.correctAnswers.getValue(),
      correctAnswer,
    ]);
  }

  public setValue(value: number, sync = true): void {
    this.value.next(value);

    if (sync) {
      this.blockApi.syncSet(value);
    }
  }
}
