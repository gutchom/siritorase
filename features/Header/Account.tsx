import { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './Account.module.css';

export default function Account() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  switch (status) {
    case 'authenticated':
      return (
        <div className={styles.container}>
          <button className={styles.account} onClick={() => setIsOpen(!isOpen)}>
            <img
              className={styles.icon}
              alt="アカウント"
              src={session?.user?.image ?? '/img/default_icon.jpg'}
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
              <button className={styles.button} onClick={() => signOut()}>
                <FaSignOutAlt />
              </button>
            </li>
          </ul>
        </div>
      );
    case 'unauthenticated':
      return (
        <button
          className={styles.login}
          onClick={() =>
            signIn('twitter', { callbackUrl: window.location.href })
          }
        >
          Twitterでログイン
        </button>
      );
    case 'loading':
      return (
        <div className={styles.container}>
          <button className={styles.account} disabled={true}>
            <img
              className={styles.icon}
              alt="アカウント"
              src="/img/default_icon.jpg"
            />
          </button>
        </div>
      );
  }
}
