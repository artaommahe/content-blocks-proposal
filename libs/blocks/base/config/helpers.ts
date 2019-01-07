import { BlockConfig } from './config';
import { getParentComponent } from '../helpers';
import { BlockGroupComponent } from '../component/group/group';
import { BLOCK_GROUP_SELECTOR } from '../conts';

export function getBlockConfig(element: HTMLElement): BlockConfig {
  const blockGroupElement = getParentComponent<BlockGroupComponent>(element, BLOCK_GROUP_SELECTOR);

  return blockGroupElement
    ? blockGroupElement.blockConfig
    : new BlockConfig();
}
