import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, debounceTime, takeUntil, filter, skip, take, withLatestFrom, scan } from 'rxjs/operators';
import { BlockApi } from '@skyeng/libs/blocks/base/service/block-api';
import { BlockService } from '@skyeng/libs/blocks/base/service/block';
import { TInputData } from '../../interface';
import { MAX_SCORE_DEFAULT } from '@skyeng/libs/blocks/base/score/const';
import { IBlockScore } from '@skyeng/libs/blocks/base/score/interface';

@Component({
  selector: 'sky-input',
  template: `
    <ng-content></ng-content>

    <sky-input-view [correctAnswers]="correctAnswers$ | async"
                    [isCorrect]="isCorrect$ | async"
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

  public correctAnswers$ = this.correctAnswers.asObservable();
  public isCorrect$: Observable<boolean | null>;
  public value$ = this.value.asObservable();
  // <---

  private blockApi: BlockApi<TInputData>;
  private destroyed = new Subject<void>();

  constructor(
    private blockService: BlockService,
  ) {
  }

  public ngOnInit() {
    // wait for answers init
    // TODO: move to model part
    this.correctAnswers$
      .pipe(
        skip(1),
        debounceTime(0),
        take(1),
        takeUntil(this.destroyed),
      )
      .subscribe(() => this.init());
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
      this.blockApi.sync.set(value);
    }
  }

  private init() {
    // ---> MODEL PART
    this.isCorrect$ = this.value$.pipe(
      withLatestFrom(this.correctAnswers),
      map(([ value, correctAnswers ]) =>
        value ? correctAnswers.includes(value) : null
      ),
    );
    // <---

    this.blockApi = this.blockService.createApi<TInputData>({
      blockId: this.id,
      sync: {
        enabled: true,
      },
      score: {
        enabled: true,
      }
    });

    // ---> SYNC PART
    this.blockApi.sync.onData()
      .pipe(
        takeUntil(this.destroyed),
      )
      .subscribe(value => this.setValue(value, false));
    // <---

    // ---> SCORING PART
    const startingScore: IBlockScore = {
      right: 0,
      wrong: 0,
      maxScore: MAX_SCORE_DEFAULT,
    };

    this.isCorrect$
      .pipe(
        filter(isCorrect => isCorrect !== null),
        withLatestFrom(this.correctAnswers),
        scan<[ boolean, string[] ], IBlockScore>(
          (score, [ isCorrect, correctAnswers ]) => this.handleScore(score, isCorrect, correctAnswers),
          startingScore
        ),
        takeUntil(this.destroyed),
      )
      .subscribe(score => this.blockApi.score.set(score));
    // <---
  }

  // ---> SCORING PART
  private handleScore(score: IBlockScore, isCorrect: boolean, correctAnswers: string[]): IBlockScore {
    if (isCorrect) {
      return {
        ...score,
        right: score.right + (score.maxScore - score.wrong),
      };
    }
    else {
      return {
        ...score,
        wrong: score.wrong + (score.maxScore / (correctAnswers.length - 1)),
      };
    }
  }
  // <---
}
