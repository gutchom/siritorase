import { readFileSync } from "node:fs";
import postcss from "postcss";

// CSS Modules内の特定セレクタが持つ宣言(プロパティ→値)を取り出す。
// ダークモード時にフォームコントロールの文字色が消える、といった
// 「実ブラウザでしか気付きにくいCSSの回帰」をユニットテストで検知するために使う。
export function getCssDeclarations(
	cssFilePath: string,
	selector: string,
): Record<string, string> {
	const css = readFileSync(cssFilePath, "utf-8");
	const root = postcss.parse(css);
	const declarations: Record<string, string> = {};

	root.walkRules(selector, (rule) => {
		rule.walkDecls((decl) => {
			declarations[decl.prop] = decl.value;
		});
	});

	return declarations;
}
