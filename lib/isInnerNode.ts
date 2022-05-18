export default function isInnerNode<E extends HTMLElement>(
  element: E,
  target: EventTarget,
): boolean {
  return target instanceof Node && element.contains(target);
}
