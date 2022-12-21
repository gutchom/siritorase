import { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import useAuth from 'lib/useAuth';
import styles from './Account.module.css';

export default function Account() {
  const { user, login, logout } = useAuth();
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
          <button className={styles.button} onClick={logout}>
            <FaSignOutAlt />
          </button>
        </li>
      </ul>
    </div>
  );
}
