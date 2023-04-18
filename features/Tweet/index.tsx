import Editor from 'features/Tweet/Editor';
import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';
import { BsTwitter } from 'react-icons/bs';
import Twitter from 'twitter-text';
import Modal from 'features/Modal';
import styles from './index.module.css';

type Props = {
  pictureId: string;
  history: string;
  tweetId: string;
  tweetUserId: string;
  onTweet(tweetId: string, tweetUserId: string): void;
};

export default function Tweet(props: Props) {
  const {
    pictureId,
    history,
    tweetId: parentTweetId,
    tweetUserId,
    onTweet,
  } = props;
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [tweetText] = useState(getTweetText(pictureId, tweetUserId));

  return (
    <>
      {() => {
        switch (status) {
          case 'loading':
            return null;
          case 'authenticated':
            return (
              <button
                className={styles.trigger}
                onClick={() => setIsOpen(true)}
              >
                結果をツイートする
              </button>
            );
          case 'unauthenticated':
            return (
              <button
                className={styles.trigger}
                onClick={async () => {
                  await signIn();
                  setIsOpen(true);
                }}
              >
                ログインしてツイートする
              </button>
            );
        }
      }}
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
                if (status === 'authenticated') {
                  const [tweetId, tweetUserId] = await tweet(
                    session?.user.uid,
                    tweetText,
                    parentTweetId,
                  );
                  onTweet(tweetId, tweetUserId);
                } else {
                  await signIn();
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
