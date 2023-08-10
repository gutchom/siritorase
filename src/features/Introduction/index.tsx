import Modal from '@/features/Modal';
import useTwitter from '@/functions/twitter/useTwitter';
import styles from './index.module.css';

type Props = {
  visible: boolean;
  onClose(): void;
};

export default function Introduction(props: Props) {
  const { visible, onClose } = props;
  const { login } = useTwitter();

  return (
    <Modal
      visible={visible}
      onCloseClick={onClose}
      header={<header className={styles.header}>しりとらせとは？</header>}
      footer={
        <footer className={styles.footer}>
          <button className={styles.login} onClick={login}>
            Twitterでログイン！
          </button>
        </footer>
      }
    >
      <p className={styles.paragraph}>
        &quot;しりとらせ&quot;はTwitterでお絵描きしりとりができるサービスです。しりとりの続きをどんどん描いてツイートしよう！
      </p>
    </Modal>
  );
}
