import { NgModule, Injector } from '@angular/core';
import { BlocksExampleModule } from './+example/module';
import { createCustomElement } from '@angular/elements';
import { EXAMPLE_BLOCKS } from './+example/blocks';

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
      const element = createCustomElement(component, { injector: this.injector });

      customElements.define(selector, element);
    });
  }
}
