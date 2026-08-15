import Editor from './Editor';
import { useState } from 'react';
import { BsTwitter } from 'react-icons/bs';
import Twitter from 'twitter-text';
import Modal from '../Modal';
import createTweetIntentURL from './createTweetIntentURL';
import styles from './index.module.css';

type Props = {
  pictureId: string;
  history: string;
};

export default function Tweet(props: Props) {
  const { pictureId, history } = props;
  const [isOpen, setIsOpen] = useState(false);
  const intentURL = createTweetIntentURL(history, pictureId);
  const previewText = new URL(intentURL).searchParams.get('text') ?? '';

  return (
    <>
      <button className={styles.trigger} onClick={() => setIsOpen(true)}>
        結果をツイートする
      </button>
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
            <a
              className={styles.post}
              href={intentURL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
            >
              ツイートする
            </a>
          </div>
        }
      >
        <Editor base={Twitter.autoLink(previewText)} />
      </Modal>
    </>
  );
}
