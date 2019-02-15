import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IDndGroupDropItemFormatted, TDndGroupDragId, IDndGroupDragItemFormatted } from '../../interface';

@Component({
  selector: 'sky-dnd-group-drop-item',
  templateUrl: 'dnd-group-drop-item.html',
  styleUrls: [ 'dnd-group-drop-item.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndGroupDropItemComponent {
  @Input() draggingId: TDndGroupDragId | null;
  @Input() dropItem: IDndGroupDropItemFormatted;
  @Input() isLast: boolean;

  @Output() itemDrop = new EventEmitter<IDndGroupDropItemFormatted>();
  @Output() itemDrag = new EventEmitter<IDndGroupDragItemFormatted>();

  public isDroppable(): boolean {
    return !!this.draggingId
      && !this.dropItem.currentDrags.some(dragItem => dragItem.id === this.draggingId);
  }

  public onDropClick(): void {
    if (!this.isDroppable()) {
      return;
    }

    this.itemDrop.emit(this.dropItem);
  }

  public onItemDrag(dragItem: IDndGroupDragItemFormatted): void {
    this.itemDrag.emit(dragItem);
  }
}
