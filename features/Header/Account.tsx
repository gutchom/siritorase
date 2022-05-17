import Link from 'next/link';
import { useState } from 'react';
import { FaQuestion, FaSignOutAlt } from 'react-icons/fa';
import { auth } from 'lib/browser/firebase';
import useAuth from 'lib/useAuth';
import styles from './Account.module.css';

export default function Account() {
  const { user, login, logout } = useAuth(auth);
  const [isOpen, setIsOpen] = useState(false);

  return !user ? (
    <button className={styles.login} onClick={login}>
      Twitterでログイン
    </button>
  ) : (
    <div className={styles.container}>
      <button className={styles.account} onClick={() => setIsOpen(!isOpen)}>
        <img
          className={styles.icon}
          src={user.photoURL ?? '/default_icon.jpg'}
          alt="アカウント"
        />
      </button>
      <ul
        className={styles.buttons}
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <li>
          <Link href="/about">
            <a className={styles.about}>
              <FaQuestion />
            </a>
          </Link>
        </li>
        <li>
          <button className={styles.logout} onClick={logout}>
            <FaSignOutAlt />
          </button>
        </li>
      </ul>
    </div>
  );
}
