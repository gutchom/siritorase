import { readFileSync } from "node:fs";
import type { AtRule } from "postcss";
import postcss from "postcss";

// CSS Modules内の特定セレクタが持つ宣言(プロパティ→値)を取り出す。
// ダークモード時にフォームコントロールの文字色が消える、といった
// 「実ブラウザでしか気付きにくいCSSの回帰」をユニットテストで検知するために使う。
// @media内の同名セレクタは対象外(ベースの宣言のみ)。
export function getCssDeclarations(
	cssFilePath: string,
	selector: string,
): Record<string, string> {
	const root = postcss.parse(readFileSync(cssFilePath, "utf-8"));
	const declarations: Record<string, string> = {};

	root.walkRules(selector, (rule) => {
		if (rule.parent?.type === "atrule") return;
		rule.walkDecls((decl) => {
			declarations[decl.prop] = decl.value;
		});
	});

	return declarations;
}

// `@media (prefers-color-scheme: dark) { selector { ... } }` の宣言だけを取り出す。
export function getCssDeclarationsInDarkMedia(
	cssFilePath: string,
	selector: string,
): Record<string, string> {
	const root = postcss.parse(readFileSync(cssFilePath, "utf-8"));
	const declarations: Record<string, string> = {};

	root.walkAtRules("media", (atRule: AtRule) => {
		if (!atRule.params.includes("prefers-color-scheme: dark")) return;
		atRule.walkRules(selector, (rule) => {
			rule.walkDecls((decl) => {
				declarations[decl.prop] = decl.value;
			});
		});
	});

	return declarations;
}
