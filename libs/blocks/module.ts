import { NgModule, Injector } from '@angular/core';
import { BlocksExampleModule } from './+example/module';
import { createCustomElement } from '@angular/elements';
import { EXAMPLE_BLOCKS } from './+example/blocks';
import { ElementZoneStrategyFactory } from 'elements-zone-strategy';

const CUSTOM_ELEMENTS = [
  ...EXAMPLE_BLOCKS,
];

@NgModule({
  imports: [
    // only for example, lazy loading instead of direct import in real app
    BlocksExampleModule,
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
