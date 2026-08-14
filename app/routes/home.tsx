import { useState } from "react";
import Introduction from "../features/Introduction";
import styles from "./home.module.css";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "しりとらせ" },
		{
			name: "description",
			content: "Twitterでお絵描きしりとりができるサービス「しりとらせ」",
		},
	];
}

export default function Home() {
	const [showIntroduction, setShowIntroduction] = useState(true);

	return (
		<main className={styles.main}>
			<p className={styles.lead}>Twitterでお絵描きしりとり</p>
			<nav className={styles.nav}>
				<a className={styles.button} href="/draw">
					新しくしりとりを始める
				</a>
				<a className={styles.button} href="/graph">
					みんなの絵を見る
				</a>
			</nav>
			<Introduction
				visible={showIntroduction}
				onClose={() => setShowIntroduction(false)}
			/>
		</main>
	);
}
