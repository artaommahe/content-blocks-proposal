import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DndGroupComponent } from './component/dnd-group/dnd-group';
import { DndGroupViewComponent } from './component/dnd-group/dnd-group-view';
import { DndGroupDragComponent } from './component/dnd-group-drag/dnd-group-drag';
import { DndGroupDropComponent } from './component/dnd-group-drop/dnd-group-drop';
import { DndGroupDragItemComponent } from './component/dnd-group-drag-item/dnd-group-drag-item';
import { DndGroupDropItemComponent } from './component/dnd-group-drop-item/dnd-group-drop-item';
import { BaseModule } from '@skyeng/libs/base/module';

@NgModule({
  imports: [
    CommonModule,
    BaseModule,
  ],
  declarations: [
    DndGroupComponent,
    DndGroupViewComponent,
    DndGroupDragComponent,
    DndGroupDropComponent,
    DndGroupDragItemComponent,
    DndGroupDropItemComponent,
  ],
  entryComponents: [
    DndGroupComponent,
    DndGroupDragComponent,
    DndGroupDropComponent,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class BlocksDndGroupModule {
}
