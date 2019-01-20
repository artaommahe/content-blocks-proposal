import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ScoreService } from '../../service/score';
import { map } from 'rxjs/operators';

@Component({
  selector: 'score',
  template: `
    <score-view [right]="right$ | async"
                [wrong]="wrong$ | async"
                [remaining]="remaining$ | async">
    </score-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreComponent implements OnInit {
  public right$: Observable<number>;
  public wrong$: Observable<number>;
  public remaining$: Observable<number>;

  constructor(
    private scoreService: ScoreService,
  ) {
  }

  public ngOnInit() {
    this.right$ = this.scoreService.score$.pipe(
      map(({ right }) => right),
    );

    this.wrong$ = this.scoreService.score$.pipe(
      map(({ wrong }) => wrong),
    );

    this.remaining$ = this.scoreService.score$.pipe(
      map(({ total, right, wrong }) => +(total - right - wrong).toFixed(2)),
    );
  }
}
