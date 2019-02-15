import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IDndGroupDragItemFormatted, IDndGroupDropItemFormatted } from '../../interface';

@Component({
  selector: 'sky-dnd-group-view',
  templateUrl: 'dnd-group-view.html',
  styleUrls: [ 'dnd-group-view.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndGroupViewComponent {
  @Input() dragItems: IDndGroupDragItemFormatted[];
  @Input() dropItems: IDndGroupDropItemFormatted[];
}
