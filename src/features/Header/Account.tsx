import { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import useTwitter from '@/functions/twitter/useTwitter';
import styles from './Account.module.css';

export default function Account() {
  const { user, login, logout } = useTwitter();
  const [isOpen, setIsOpen] = useState(false);

  return !user ? (
    <button className={styles.login} onClick={login}>
      &#x1D54F;
    </button>
  ) : (
    <div className={styles.container}>
      <button className={styles.account} onClick={() => setIsOpen(!isOpen)}>
        <img
          className={styles.icon}
          alt="アカウント"
          src={user.icon ?? '/img/default_icon.jpg'}
          onError={(e) => {
            e.currentTarget.src = '/img/default_icon.jpg';
          }}
        />
      </button>
      <ul
        className={styles.buttons}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
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
