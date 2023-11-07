import appendRule from './appendRule';

export default function ruleSize(
  target: CSSStyleSheet | CSSGroupingRule,
  selector: string,
  size: number,
) {
  const rule = appendRule(target, selector);
  if (rule instanceof CSSStyleRule) {
    rule.style.width = `${size}px`;
    rule.style.height = `${size}px`;
  }
}
