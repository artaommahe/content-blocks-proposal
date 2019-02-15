import { Component, ChangeDetectionStrategy, AfterViewInit, Input, HostBinding, ElementRef } from '@angular/core';
import { getParentComponent } from '@skyeng/libs/blocks/base/core/helpers';
import { DndGroupComponent } from '../dnd-group/dnd-group';
import { IDndGroupDropItem, TDndGroupDropId } from '../../interface';
import { DND_GROUP_SELECTOR } from '../../const';

@Component({
  selector: 'sky-dnd-group-item',
  template: `
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndGroupDropComponent implements AfterViewInit {
  @Input() groupId: TDndGroupDropId;
  @Input() dragIds: string;

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

      const dropItem: IDndGroupDropItem = {
        id: this.groupId,
        dragIds: this.dragIds.split(','),
        text: element.textContent!.trim(),
        contentNodes: Array.from(element.childNodes),
      };

      dndGroupComponent.addDropItem(dropItem);
    });
  }
}
