import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'sky-block-score-indicator-view',
  template: `
    <div class="root">
      <div class="right"
           [style.height.%]="right">
      </div>

      <div class="wrong"
           [style.height.%]="wrong">
      </div>
    </div>
  `,
  styleUrls: [ 'score-indicator-view.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreIndicatorViewComponent {
  @Input() right: number;
  @Input() wrong: number;
}
