import { Component, ChangeDetectionStrategy, ElementRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { ExampleComponent } from '../example/example';
import { getParentComponent } from '@skyeng/libs/blocks/base/helpers';

@Component({
  selector: 'sky-example-answer',
  template: `
    <slot (slotchange)="onSlotChange()"
          #slot>
    </slot>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class ExampleAnswerComponent {
  @ViewChild('slot') slotRef: ElementRef<HTMLSlotElement>;

  private initDone = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
  ) {
  }

  public onSlotChange() {
    if (this.initDone) {
      return;
    }

    const textElement = this.slotRef.nativeElement.assignedNodes()[0];
    const answer = parseInt(textElement.textContent, 10);
    const exampleComponent = getParentComponent<ExampleComponent>(this.elementRef.nativeElement, 'sky-example');

    exampleComponent.addCorrectAnswer(answer);

    this.elementRef.nativeElement.textContent = '';
    this.initDone = true;
  }
}
