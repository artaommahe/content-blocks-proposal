import { NgModule } from '@angular/core';
import { InputComponent } from './component/input/input';
import { CommonModule } from '@angular/common';
import { InputViewComponent } from './component/input/input-view';
import { InputAnswerComponent } from './component/input-answer/input-answer';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    InputComponent,
    InputAnswerComponent,
    InputViewComponent,
  ],
  entryComponents: [
    InputComponent,
    InputAnswerComponent,
  ]
})
export class BlocksInputModule {
}
