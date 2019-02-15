import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IDndGroupDragItemFormatted, IDndGroupDropItemFormatted, TDndGroupDragId, IDropData } from '../../interface';

@Component({
  selector: 'sky-dnd-group-view',
  templateUrl: 'dnd-group-view.html',
  styleUrls: [ 'dnd-group-view.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndGroupViewComponent {
  @Input() dragItems: IDndGroupDragItemFormatted[];
  @Input() dropItems: IDndGroupDropItemFormatted[];
  @Input() isMobile: boolean;
  @Input() draggingId: TDndGroupDragId | null;

  @Output() itemDrag = new EventEmitter<IDndGroupDragItemFormatted>();
  @Output() itemDrop = new EventEmitter<IDropData>();

  public onItemDrag(dragItem: IDndGroupDragItemFormatted): void {
    this.itemDrag.emit(dragItem);
  }

  public onItemDrop(dropItem: IDndGroupDropItemFormatted): void {
    const drop: IDropData = {
      dropItem,
      draggingId: this.draggingId!,
    };

    this.itemDrop.emit(drop);
  }
}
