import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class BlocksInputModule {
}
