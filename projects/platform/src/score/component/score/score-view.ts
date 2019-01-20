import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'score-view',
  templateUrl: 'score-view.html',
  styleUrls: [ 'score-view.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreViewComponent {
  @Input() right: number;
  @Input() wrong: number;
  @Input() remaining: number;
}
