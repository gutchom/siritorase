import Modal from 'features/Modal';
import useAuth from 'lib/useAuth';
import styles from './index.module.css';

type Props = {
  visible: boolean;
  onClose(): void;
};

export default function Introduction(props: Props) {
  const { visible, onClose } = props;
  const { login } = useAuth();

  return (
    <Modal
      visible={visible}
      onCloseClick={onClose}
      header={<header className={styles.header}>しりとらせとは？</header>}
      footer={
        <footer className={styles.footer}>
          <button className={styles.login} onClick={login}>
            Twitterでログインする
          </button>
        </footer>
      }
    >
      <p className={styles.paragraph}>
        しりとらせはTwitterでお絵描きしりとりができるサービスです。しりとりの続きの絵を描いてどんどんツイートしよう！
      </p>
    </Modal>
  );
}
