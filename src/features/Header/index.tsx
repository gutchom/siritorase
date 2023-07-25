import Account from 'src/features/Header/Account';
import styles from 'src/features/Header/index.module.css';

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
