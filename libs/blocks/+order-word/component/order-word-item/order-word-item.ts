import { Component, ChangeDetectionStrategy, AfterViewInit, Input, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { OrderWordComponent } from '../order-word/order-word';
import { getParentComponent } from '@skyeng/libs/blocks/base/helpers';
import { IOrderWordItem } from '../../interface';

@Component({
  selector: 'sky-order-word-item',
  template: `
    <ng-template><ng-content></ng-content></ng-template>
    <ng-container *ngTemplateOutlet="templateRef"></ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderWordItemComponent implements AfterViewInit {
  @Input() answerId: string;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
  ) {
  }

  public ngAfterViewInit() {
    const orderWordComponent = getParentComponent<OrderWordComponent>(this.elementRef.nativeElement, 'sky-order-word');

    if (!orderWordComponent) {
      return;
    }

    const answer: IOrderWordItem = {
      id: this.answerId,
      text: this.elementRef.nativeElement.textContent!.trim(),
      templateRef: this.templateRef,
    };

    orderWordComponent.addItem(answer);
  }
}
