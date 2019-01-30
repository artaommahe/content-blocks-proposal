import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { TBlockId } from '@skyeng/libs/blocks/base/core/interface';
import { Observable } from 'rxjs';
import { share, map } from 'rxjs/operators';
import { BlockScoreApi } from '../../service/score-api';

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
export class ScoreIndicatorComponent implements OnInit {
  @Input() blockId: TBlockId;

  public right$: Observable<number>;
  public wrong$: Observable<number>;

  constructor(
    private blockScoreApi: BlockScoreApi,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  public ngOnInit() {
    // empty inputs bug https://github.com/angular/angular/issues/28266
    window.setTimeout(() => {
      const score$ = this.blockScoreApi.onSet(this.blockId).pipe(
        share(),
      );

      this.right$ = score$.pipe(
        map(score => (score.right * 100)),
      );

      this.wrong$ = score$.pipe(
        map(score => (score.wrong * 100)),
      );

      this.changeDetectorRef.markForCheck();
    });
  }
}
