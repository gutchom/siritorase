import Modal from '../Modal';
import styles from './index.module.css';

type Props = {
  visible: boolean;
  onClose(): void;
};

export default function Introduction(props: Props) {
  const { visible, onClose } = props;

  return (
    <Modal
      visible={visible}
      onCloseClick={onClose}
      header={<header className={styles.header}>しりとらせとは？</header>}
      footer={
        <footer className={styles.footer}>
          <a className={styles.login} href="/auth/twitter/login">
            Twitterでログイン！
          </a>
        </footer>
      }
    >
      <p className={styles.paragraph}>
        &quot;しりとらせ&quot;はTwitterでお絵描きしりとりができるサービスです。しりとりの続きをどんどん描いてツイートしよう！
      </p>
    </Modal>
  );
}
