import { Component, ChangeDetectionStrategy, Input, ElementRef, HostBinding, AfterViewInit } from '@angular/core';
import { OrderWordComponent } from '../order-word/order-word';
import { getParentComponent } from '@skyeng/libs/blocks/base/core/helpers';
import { IOrderWordItem } from '../../interface';

@Component({
  selector: 'sky-order-word-item',
  template: `
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderWordItemComponent implements AfterViewInit {
  @Input() answerId: string;

  @HostBinding('attr.hidden') hidden = true;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
  ) {
  }

  public ngAfterViewInit() {
    // no ng-content content on init
    window.setTimeout(() => {
      const orderWordComponent = getParentComponent<OrderWordComponent>(this.elementRef.nativeElement, 'sky-order-word');

      if (!orderWordComponent) {
        return;
      }

      const element = this.elementRef.nativeElement;

      const answer: IOrderWordItem = {
        id: this.answerId,
        text: element.textContent!.trim(),
        contentNodes: Array.from(element.childNodes),
      };

      orderWordComponent.addItem(answer);
    });
  }
}
