export function getParentComponent<T>(element: HTMLElement, selector: string): T | undefined {
  return element.closest(selector) as unknown as T;
}
