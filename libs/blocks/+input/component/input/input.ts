import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, combineLatest, debounceTime, takeUntil, filter } from 'rxjs/operators';
import { BlockApi } from '@skyeng/libs/blocks/base/service/block-api';
import { BlockService } from '@skyeng/libs/blocks/base/service/block';
import { TInputData } from '../../interface';

@Component({
  selector: 'sky-input',
  template: `
    <ng-content></ng-content>

    <sky-input-view [isCorrect]="isCorrect$ | async"
                    [value]="value$ | async"
                    (valueChange)="setValue($event)">
    </sky-input-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnInit, OnDestroy {
  @Input() id: string;

  // ---> MODEL PART
  private correctAnswers = new BehaviorSubject<string[]>([]);
  private value = new BehaviorSubject<TInputData>('');

  public isCorrect$: Observable<boolean>;
  public value$ = this.value.asObservable();
  // <---

  private blockApi: BlockApi<TInputData>;
  private destroyed = new Subject<void>();

  constructor(
    private blockService: BlockService,
  ) {
  }

  public ngOnInit() {
    // ---> MODEL PART
    const correctAnswers$ = this.correctAnswers.pipe(
      debounceTime(0),
    );

    this.isCorrect$ = this.value$.pipe(
      combineLatest(correctAnswers$),
      map(([ value, correctAnswers ]) => correctAnswers.includes(value)),
    );
    // <---

    this.blockApi = this.blockService.createApi<TInputData>({
      id: this.id,
      sync: {
        enabled: true,
      },
      scoring: {
        enabled: true,
      }
    });

    this.blockApi.syncOnData()
      .pipe(
        takeUntil(this.destroyed),
      )
      .subscribe(value => this.setValue(value, false));

    // ---> SCORING PART
    this.isCorrect$
      .pipe(
        filter(isCorrect => isCorrect),
        takeUntil(this.destroyed),
      )
      .subscribe(() => this.blockApi.scoringSet(true, 1));
    // <---
  }

  public ngOnDestroy() {
    this.blockApi.destroy();
    this.destroyed.next();
    this.destroyed.complete();
  }

  // https://github.com/angular/angular/issues/22114
  @Input()
  public addCorrectAnswer = (correctAnswer: string): void => {
    this.correctAnswers.next([
      ...this.correctAnswers.getValue(),
      correctAnswer,
    ]);
  }

  public setValue(value: TInputData, sync = true): void {
    this.value.next(value);

    if (sync) {
      this.blockApi.syncSet(value);
    }
  }
}
