import { DndGroupComponent } from './component/dnd-group/dnd-group';
import { DND_GROUP_SELECTOR } from './const';
import { DndGroupDragComponent } from './component/dnd-group-drag/dnd-group-drag';
import { DndGroupDropComponent } from './component/dnd-group-drop/dnd-group-drop';

export const DND_GROUP_BLOCKS = [
  { selector: DND_GROUP_SELECTOR, component: DndGroupComponent },
  { selector: 'sky-dnd-group-drag', component: DndGroupDragComponent },
  { selector: 'sky-dnd-group-item', component: DndGroupDropComponent },
];
