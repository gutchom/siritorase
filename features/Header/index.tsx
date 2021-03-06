import Link from 'next/link';
import Account from './Account';
import styles from './index.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <Link href="/">
          <a className={styles.link}>しりとらせ</a>
        </Link>      </h1>
      <div className={styles.account}>
        <Account />
      </div>
    </header>
  );
}
