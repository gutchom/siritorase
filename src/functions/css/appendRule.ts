export default function appendRule(
  target: CSSStyleSheet | CSSGroupingRule,
  selector: string,
): CSSRule {
  const index = target.insertRule(`${selector}{}`, target.cssRules.length);
  return target.cssRules[index];
}
