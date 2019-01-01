import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreComponent } from './component/score/score';
import { ScoreViewComponent } from './component/score/score-view';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ScoreComponent,
    ScoreViewComponent,
  ],
  exports: [
    ScoreComponent,
    ScoreViewComponent,
  ],
})
export class ScoreModule {
}
