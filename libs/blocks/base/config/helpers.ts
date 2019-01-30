import { BlockConfig } from './config';
import { getParentComponent } from '../core/helpers';
import { BlockGroupComponent } from '../core/component/group/group';
import { BLOCK_GROUP_SELECTOR } from '../core/conts';

export function getBlockConfig(element: HTMLElement): BlockConfig {
  const blockGroupElement = getParentComponent<BlockGroupComponent>(element, BLOCK_GROUP_SELECTOR);

  return blockGroupElement
    ? blockGroupElement.blockConfig
    : new BlockConfig();
}
