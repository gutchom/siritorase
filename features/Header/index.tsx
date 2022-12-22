import Account from './Account';
import styles from './index.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>しりとらせ</h1>
      <div className={styles.account}>
        <Account />
      </div>
    </header>
  );
}
