import { NgModule, Injector } from '@angular/core';
import { BlocksInputModule } from './+input/module';
import { createCustomElement } from '@angular/elements';
import { INPUT_BLOCKS } from './+input/blocks';
import { ElementZoneStrategyFactory } from 'elements-zone-strategy';
import { BlocksBaseModule } from './base/module';
import { BASE_BLOCKS } from './base/blocks';
import { SCORE_BLOCKS } from './base/score/blocks';
import { BlocksScoreModule } from './base/score/module';
import { BlocksOrderWordModule } from './+order-word/module';
import { ORDER_WORD_BLOCKS } from './+order-word/blocks';

const CUSTOM_ELEMENTS = [
  ...BASE_BLOCKS,
  ...INPUT_BLOCKS,
  ...SCORE_BLOCKS,
  ...ORDER_WORD_BLOCKS,
];

@NgModule({
  imports: [
    // only for example, lazy loading instead of direct import in real app
    BlocksBaseModule,
    BlocksInputModule,
    BlocksScoreModule,
    BlocksOrderWordModule,
  ]
})
export class BlocksModule {
  constructor(
    private injector: Injector,
  ) {
    CUSTOM_ELEMENTS.forEach(({ component, selector }) => {
      const strategyFactory = new ElementZoneStrategyFactory(component, this.injector);
      const element = createCustomElement(component, { injector: this.injector, strategyFactory });

      customElements.define(selector, element);
    });
  }
}
