import { NgModule, Injector } from '@angular/core';
import { BlocksInputModule } from './+input/module';
import { createCustomElement } from '@angular/elements';
import { INPUT_BLOCKS } from './+input/blocks';
import { ElementZoneStrategyFactory } from 'elements-zone-strategy';

const CUSTOM_ELEMENTS = [
  ...INPUT_BLOCKS,
];

@NgModule({
  imports: [
    // only for example, lazy loading instead of direct import in real app
    BlocksInputModule,
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
