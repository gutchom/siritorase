import { useEffect, useState } from 'react';
import styles from './index.module.css';

const HOST_DOMAIN = 'https://siritorase.vercel.app';

type Props = {
  id: string;
  title: string;
  picture: Blob;
  history: string[];
};

export function Result(props: Props) {
  const { id, title, picture, history } = props;
  const [url, setUrl] = useState(URL.createObjectURL(picture));

  useEffect(() => {
    setUrl(URL.createObjectURL(picture));
  }, [picture]);

  return (
    <div className={styles.container}>
      <figure>
        <img className={styles.picture} src={url} alt={title} />
        <figcaption className={styles.caption}>{title}</figcaption>
      </figure>

      <a
        className={styles.tweet}
        href={createTweetIntentURL(id, title, history)}
      >
        結果をツイートする
      </a>
      <a className={styles.download} href={url} download={`${title}.png`}>
        画像をダウンロードする
      </a>
    </div>
  );
}

function createTweetIntentURL(
  id: string,
  title: string,
  history: string[],
): string {
  const url = new URL('https://twitter.com/intent/tweet');
  url.searchParams.set(
    'text',
    `絵しりとりを描いたよ！\n${history.join('→')}→？？？`,
  );
  url.searchParams.set('url', `${HOST_DOMAIN}/${id}`);
  url.searchParams.set('hashtags', 'しりとり,絵しりとり');

  return url.href;
}
