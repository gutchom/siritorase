import Editor from 'features/Tweet/Editor';
import { useState } from 'react';
import useAuth from 'lib/useAuth';
import Modal from 'features/Modal';
import styles from './index.module.css';

type Props = {
  pictureId: string;
  tweetId: string;
  tweetUserId: string;
  onTweet(tweetId: string, tweetUserId: string): void;
};

export default function Tweet(props: Props) {
  const { pictureId, tweetId: parentTweetId, tweetUserId, onTweet } = props;
  const { user, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tweetText, setTweetText] = useState(
    getTweetText(pictureId, tweetUserId),
  );

  return (
    <>
      {user ? (
        <button className={styles.trigger} onClick={() => setIsOpen(true)}>
          ツイートする
        </button>
      ) : (
        <button
          className={styles.trigger}
          onClick={async () => {
            await login;
            setIsOpen(true);
          }}
        >
          Twitterでログインしてツイートする
        </button>
      )}
      <Modal
        visible={isOpen}
        header={<h1 className={styles.header}>ツイート</h1>}
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
                    user.uid,
                    tweetText,
                    parentTweetId,
                  );
                  onTweet(tweetId, tweetUserId);
                } else {
                  await login();
                }
              }}
            >
              ツイートする
            </button>
          </div>
        }
      >
        {<Editor baseText={tweetText} onChange={setTweetText} />}
      </Modal>
    </>
  );
}

function getTweetText(id: string, parentTweetUser?: string): string {
  const text = [
    '絵しりとりを描いたよ！リンク先からしりとりの続きに参加しよう',
    `https://siritorase.vercel.app/${id}`,
    '#絵しりとり #しりとり #しりとらせ',
  ].join('\n');
  const mention = `@${parentTweetUser}`;

  return parentTweetUser ? mention + text : text;
}

async function tweet(
  uid: string,
  text: string,
  parentTweetId?: string,
): Promise<[string, string]> {
  const body = JSON.stringify({ uid, text, parentTweetId });
  const response = await fetch(new Request('/api/tweet'), {
    method: 'POST',
    body,
  });
  if (response.ok) {
    const { tweetId, tweetUserId } = await response.json();
    return [tweetId, tweetUserId];
  } else {
    throw new Error('Failed to tweet.');
  }
}
