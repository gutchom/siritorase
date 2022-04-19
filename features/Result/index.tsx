import styles from './index.module.css';

type Props = {
  id: string;
  title: string;
  picture: string;
  history: string;
};

export default function Result(props: Props) {
  const { id, title, picture, history } = props;

  return (
    <div className={styles.container}>
      <figure>
        <img
          className={styles.picture}
          src={picture}
          alt={title}
          onLoad={(e) => {
            URL.revokeObjectURL(e.currentTarget.src);
          }}
        />
        <figcaption className={styles.caption}>{title}</figcaption>
      </figure>

      <a className={styles.tweet} href={createTweetIntentURL(id, history)}>
        ツイートする
      </a>
      <a className={styles.download} href={picture} download={`${title}.png`}>
        画像をダウンロードする
      </a>
    </div>
  );
}

function createTweetIntentURL(id: string, history: string): string {
  const url = new URL('https://twitter.com/intent/tweet');
  url.searchParams.set('text', `絵しりとりを描いたよ！\n\n${history}\n`);
  url.searchParams.set('url', `https://siritorase.vercel.app/${id}`);
  url.searchParams.set('hashtags', 'しりとり,絵しりとり');

  return url.href;
}
