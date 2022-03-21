import styles from './index.module.css';

type Props = {
  id: string;
  title: string;
  picture: string;
  history: string;
};

export function Result(props: Props) {
  const { id, title, picture, history } = props;

  return (
    <div className={styles.container}>
      <figure>
        <img className={styles.picture} src={picture} alt={title} />
        <figcaption className={styles.caption}>{title}</figcaption>
      </figure>

      <a
        className={styles.tweet}
        href={createTweetIntentURL(id, title, history)}
      >
        結果をツイートする
      </a>
      <a className={styles.download} href={picture} download={`${title}.png`}>
        画像をダウンロードする
      </a>
    </div>
  );
}

function createTweetIntentURL(
  id: string,
  title: string,
  history: string,
): string {
  const url = new URL('https://twitter.com/intent/tweet');
  url.searchParams.set('text', `絵しりとりを描いたよ！\n\n${history}\n\n`);
  url.searchParams.set('url', `https://siritorase.vercel.app/${id}`);
  url.searchParams.set('hashtags', 'しりとり,絵しりとり');

  return url.href;
}
