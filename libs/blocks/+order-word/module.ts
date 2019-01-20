import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderWordComponent } from './component/order-word/order-word';
import { OrderWordItemComponent } from './component/order-word-item/order-word-item';
import { OrderWordViewComponent } from './component/order-word/order-word-view';
import { OrderWordAnswerItemComponent } from './component/order-word-answer-item/order-word-answer-item';
import { BaseModule } from '@skyeng/libs/base/module';

@NgModule({
  imports: [
    CommonModule,
    BaseModule,
  ],
  declarations: [
    OrderWordComponent,
    OrderWordItemComponent,
    OrderWordViewComponent,
    OrderWordAnswerItemComponent,
  ],
  entryComponents: [
    OrderWordComponent,
    OrderWordItemComponent,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA, ]
})
export class BlocksOrderWordModule {
}
