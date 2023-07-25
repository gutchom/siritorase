import { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import useAuth from 'src/lib/useAuth';
import styles from 'src/features/Header/Account.module.css';

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
          alt="アカウント"
          src={user.photoURL ?? '/img/default_icon.jpg'}
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
          <button className={styles.button} onClick={logout}>
            <FaSignOutAlt />
          </button>
        </li>
      </ul>
    </div>
  );
}
