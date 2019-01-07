import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreIndicatorComponent } from './component/score-indicator/score-indicator';
import { ScoreIndicatorViewComponent } from './component/score-indicator/score-indicator-view';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ScoreIndicatorComponent,
    ScoreIndicatorViewComponent,
  ],
  entryComponents: [
    ScoreIndicatorComponent,
  ],
})
export class BlocksScoreModule {
}
