import type { AuthUser } from '../../lib/auth.server';
import Account from './Account';
import styles from './index.module.css';

type Props = {
  user: AuthUser | null;
};

export default function Header({ user }: Props) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>しりとらせ</h1>
      <div className={styles.account}>
        <Account user={user} />
      </div>
    </header>
  );
}
