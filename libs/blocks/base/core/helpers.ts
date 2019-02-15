import * as shuffleSeed from 'shuffle-seed';

export function getParentComponent<T>(element: HTMLElement, selector: string): T | undefined {
  return element.closest(selector) as unknown as T;
}

export function shuffleItems<T extends { id: string }>(items: T[]): T[] {
  if (items.length < 2) {
    return items;
  }

  let seed = items.map(item => item.id).join('');
  let limit = 1000;
  let shuffledItems = items;

  do {
    shuffledItems = shuffleSeed.shuffle(shuffledItems, seed);
    seed += '_';
    limit--;
  } while (limit && (shuffledItems[0] === items[0]));

  return shuffledItems;
}
