import Editor from './Editor';
import { useState } from 'react';
import { useFetcher } from 'react-router';
import { BsTwitter } from 'react-icons/bs';
import Twitter from 'twitter-text';
import Modal from '../Modal';
import createTweetIntentURL from './createTweetIntentURL';
import parseTweetUrl from './parseTweetUrl';
import styles from './index.module.css';

type Props = {
  pictureId: string;
  history: string;
  parentTweetId?: string | null;
  parentTweetScreenName?: string | null;
};

export default function Tweet(props: Props) {
  const { pictureId, history, parentTweetId, parentTweetScreenName } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'compose' | 'link'>('compose');
  const [tweetUrlInput, setTweetUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fetcher = useFetcher();

  const pictureUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/reply/${pictureId}`
      : `/reply/${pictureId}`;
  const intentURL = createTweetIntentURL(
    history,
    pictureUrl,
    parentTweetId ?? undefined,
    parentTweetScreenName ?? undefined,
  );
  const previewText = new URL(intentURL).searchParams.get('text') ?? '';

  function open() {
    setStep('compose');
    setTweetUrlInput('');
    setError(null);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function saveTweetLink() {
    const parsed = parseTweetUrl(tweetUrlInput);
    if (!parsed) {
      setError('ツイートのURLの形式が正しくありません(例: https://x.com/ユーザー名/status/12345)');
      return;
    }
    fetcher.submit(
      { tweetId: parsed.tweetId, tweetScreenName: parsed.screenName },
      { method: 'post', action: `/pictures/${pictureId}/tweet-link` },
    );
    close();
  }

  return (
    <>
      <button className={styles.trigger} onClick={open}>
        結果をツイートする
      </button>
      <Modal
        visible={isOpen}
        onCloseClick={close}
        header={
          <h1 className={styles.header}>
            <BsTwitter />
          </h1>
        }
        footer={
          step === 'compose' ? (
            <div className={styles.footer}>
              <button className={styles.cancel} onClick={close}>
                キャンセル
              </button>
              <a
                className={styles.post}
                href={intentURL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setStep('link')}
              >
                ツイートする
              </a>
            </div>
          ) : (
            <div className={styles.linkFooter}>
              <p className={styles.linkHint}>
                ツイートできましたか？投稿したツイートのURLを貼ると、次に続きを描いた人のツイートがこのツイートへの返信として繋がります(スキップも可)
              </p>
              <input
                className={styles.linkInput}
                type="url"
                placeholder="https://x.com/ユーザー名/status/..."
                value={tweetUrlInput}
                onChange={(e) => {
                  setTweetUrlInput(e.target.value);
                  setError(null);
                }}
              />
              {error && <p className={styles.linkError}>{error}</p>}
              <div className={styles.footer}>
                <button className={styles.cancel} onClick={close}>
                  スキップ
                </button>
                <button className={styles.post} onClick={saveTweetLink}>
                  保存
                </button>
              </div>
            </div>
          )
        }
      >
        <Editor base={Twitter.autoLink(previewText)} />
      </Modal>
    </>
  );
}
