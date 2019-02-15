import { Component, ChangeDetectionStrategy, AfterViewInit, Input, HostBinding, ElementRef } from '@angular/core';
import { getParentComponent } from '@skyeng/libs/blocks/base/core/helpers';
import { DndGroupComponent } from '../dnd-group/dnd-group';
import { IDndGroupDragItem, TDndGroupDragId } from '../../interface';
import { DND_GROUP_SELECTOR } from '../../const';

@Component({
  selector: 'sky-dnd-group-drag',
  template: `
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndGroupDragComponent implements AfterViewInit {
  @Input() answerId: TDndGroupDragId;

  @HostBinding('attr.hidden') hidden = true;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
  ) {
  }

  public ngAfterViewInit() {
    // no ng-content content on init
    window.setTimeout(() => {
      const dndGroupComponent = getParentComponent<DndGroupComponent>(this.elementRef.nativeElement, DND_GROUP_SELECTOR);

      if (!dndGroupComponent) {
        return;
      }

      const element = this.elementRef.nativeElement;

      const dragItem: IDndGroupDragItem = {
        id: this.answerId,
        text: element.textContent!.trim(),
        contentNodes: Array.from(element.childNodes),
      };

      dndGroupComponent.addDragItem(dragItem);
    });
  }
}
