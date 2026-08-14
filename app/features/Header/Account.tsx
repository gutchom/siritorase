import { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import type { AuthUser } from '../../lib/auth.server';
import styles from './Account.module.css';

type Props = {
  user: AuthUser | null;
};

export default function Account({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return !user ? (
    <a className={styles.login} href="/auth/twitter/login">
      Twitterでログイン
    </a>
  ) : (
    <div className={styles.container}>
      <button className={styles.account} onClick={() => setIsOpen(!isOpen)}>
        <img
          className={styles.icon}
          alt="アカウント"
          src={user.profileImageUrl ?? '/img/default_icon.jpg'}
          onError={(e) => {
            e.currentTarget.src = '/img/default_icon.jpg';
          }}
        />
      </button>
      <ul
        className={styles.buttons}
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <li>
          <form method="post" action="/auth/logout">
            <button className={styles.button} type="submit">
              <FaSignOutAlt />
            </button>
          </form>
        </li>
      </ul>
    </div>
  );
}
