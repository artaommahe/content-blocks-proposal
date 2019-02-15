import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IDndGroupDragItemFormatted, TDndGroupDragId } from '../../interface';

@Component({
  selector: 'sky-dnd-group-drag-item',
  templateUrl: 'dnd-group-drag-item.html',
  styleUrls: [ 'dnd-group-drag-item.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndGroupDragItemComponent {
  @Input() dragItem: IDndGroupDragItemFormatted;
  @Input() inDrop: boolean;
  @Input() draggingId: TDndGroupDragId | null;

  @Output() itemDrag = new EventEmitter<IDndGroupDragItemFormatted>();

  public onClick(): void {
    if (!this.isDraggable()) {
      return;
    }

    this.itemDrag.emit(this.dragItem);
  }

  public isDragging(): boolean {
    return this.draggingId === this.dragItem.id
      && (!this.isDropped() || this.inDrop);
  }

  public isDraggable(): boolean {
    return !this.isCorrect()
      && (!this.dragItem.currentDropId || this.inDrop);
  }

  public isDropped(): boolean {
    return !this.inDrop && !!this.dragItem.currentDropId;
  }

  public isCorrect(): boolean {
    return this.dragItem.isCorrect === true;
  }

  public isWrong(): boolean {
    return this.dragItem.isCorrect === false;
  }
}
