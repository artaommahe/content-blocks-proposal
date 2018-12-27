import { NgModule, Injector } from '@angular/core';
import { ExampleComponent } from './component/example/example';
import { CommonModule } from '@angular/common';
import { ExampleViewComponent } from './component/example/example-view';
import { ExampleAnswerComponent } from './component/example-answer/example-answer';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ExampleComponent,
    ExampleAnswerComponent,
    ExampleViewComponent,
  ],
  entryComponents: [
    ExampleComponent,
    ExampleAnswerComponent,
  ]
})
export class BlocksExampleModule {
}
