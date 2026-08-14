import Editor from './Editor';
import { useState } from 'react';
import { BsTwitter } from 'react-icons/bs';
import Twitter from 'twitter-text';
import type { AuthUser } from '../../lib/auth.server';
import Modal from '../Modal';
import styles from './index.module.css';

type Props = {
  user: AuthUser | null;
  pictureId: string;
  history: string;
  tweetId: string;
  tweetUserId: string;
  onTweet(tweetId: string, tweetUserId: string): void;
};

const LOGIN_URL = '/auth/twitter/login';

export default function Tweet(props: Props) {
  const {
    user,
    pictureId,
    history,
    tweetId: parentTweetId,
    tweetUserId,
    onTweet,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [tweetText] = useState(getTweetText(pictureId, tweetUserId));

  return (
    <>
      {user ? (
        <button className={styles.trigger} onClick={() => setIsOpen(true)}>
          結果をツイートする
        </button>
      ) : (
        <a className={styles.trigger} href={LOGIN_URL}>
          ログインしてツイートする
        </a>
      )}
      <Modal
        visible={isOpen}
        onCloseClick={() => setIsOpen(false)}
        header={
          <h1 className={styles.header}>
            <BsTwitter />
          </h1>
        }
        footer={
          <div className={styles.footer}>
            <button className={styles.cancel} onClick={() => setIsOpen(false)}>
              キャンセル
            </button>
            <button
              className={styles.post}
              onClick={async () => {
                if (user) {
                  const [tweetId, tweetUserId] = await tweet(
                    pictureId,
                    tweetText,
                    parentTweetId,
                  );
                  onTweet(tweetId, tweetUserId);
                } else {
                  window.location.href = LOGIN_URL;
                }
              }}
            >
              ツイートする
            </button>
          </div>
        }
      >
        <Editor
          base={Twitter.autoLink(getTweetText(pictureId, history, 'gutchom'))}
        />
      </Modal>
    </>
  );
}

function getTweetText(
  id: string,
  history: string,
  parentTweetUser?: string,
): string {
  const mention = `@${parentTweetUser}`;
  const text = [
    history,
    '',
    '絵しりとりを描いたよ！リンクからしりとりの続きに参加しよう',
    '',
    '#絵しりとり #しりとらせ',
    `https://siritorase.vercel.app/${id}`,
  ];

  return (parentTweetUser ? [mention, '', ...text] : text).join('\n<br>\n');
}

async function tweet(
  pictureId: string,
  text: string,
  inReplyToTweetId?: string,
): Promise<[string, string]> {
  const body = JSON.stringify({ pictureId, text, inReplyToTweetId });
  const response = await fetch(new Request('/api/tweet'), {
    method: 'POST',
    body,
  });
  if (response.ok) {
    const { tweetId, tweetUserId } = (await response.json()) as {
      tweetId: string;
      tweetUserId: string;
    };
    return [tweetId, tweetUserId];
  } else {
    throw new Error('Failed to tweet.');
  }
}
