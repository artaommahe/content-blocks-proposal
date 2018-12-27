export function getParentComponent<T>(element: HTMLElement, selector: string): T {
  return element.closest(selector) as unknown as T;
}
