import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { TBlockId } from '@skyeng/libs/blocks/base/core/interface';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlockScoreApi } from '../../service/score-api';
import { IBlockScore } from '../../interface';
import { takeUntilDestroyed } from '@skyeng/libs/base/operator/take-until-destroyed';

@Component({
  selector: 'sky-block-score-indicator',
  template: `
    <sky-block-score-indicator-view *ngIf="right$"
                                    [right]="right$ | async"
                                    [wrong]="wrong$ | async">
    </sky-block-score-indicator-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreIndicatorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() blockId?: TBlockId;
  @Input() score?: Omit<IBlockScore, 'maxScore'>;

  public right$: Observable<number>;
  public wrong$: Observable<number>;

  private scoreSubj = new BehaviorSubject<Omit<IBlockScore, 'maxScore'>>({ right: 0, wrong: 0 });

  constructor(
    private blockScoreApi: BlockScoreApi,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  public ngOnInit() {
    // empty inputs bug https://github.com/angular/angular/issues/28266
    window.setTimeout(() => {
      if (this.blockId) {
        this.blockScoreApi.onSet(this.blockId)
          .pipe(
            takeUntilDestroyed(this),
          )
          .subscribe(this.scoreSubj);
      }

      this.right$ = this.scoreSubj.pipe(
        map(score => (score.right * 100)),
      );

      this.wrong$ = this.scoreSubj.pipe(
        map(score => (score.wrong * 100)),
      );

      this.changeDetectorRef.markForCheck();
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.score && this.score) {
      this.scoreSubj.next(this.score);
    }
  }

  public ngOnDestroy() {
  }
}
