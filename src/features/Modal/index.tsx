import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './index.module.css';

type Props = {
  visible: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  onCloseClick(): void;
};

export default function Modal(props: Props) {
  const { header, footer, visible, children, onCloseClick } = props;
  const background = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      content.current?.scrollTo(0, 1);
    }
  }, [visible]);

  useEffect(() => {
    function preventBehindScroll(e: TouchEvent) {
      if (content.current && background.current && e.target instanceof Node) {
        const { scrollTop, scrollHeight, clientHeight } = content.current;
        const bottom = scrollHeight - clientHeight;

        if (background.current.contains(e.target)) {
          e.stopPropagation();
        } else if (scrollTop === 0 || scrollTop === bottom) {
          e.preventDefault();
        }
      }
    }

    window.addEventListener('touchmove', preventBehindScroll);
    return () => {
      window.removeEventListener('touchmove', preventBehindScroll);
    };
  }, []);

  function adjustScroll() {
    if (content.current) {
      const { scrollTop, scrollHeight, clientHeight } = content.current;
      const bottom = scrollHeight - clientHeight;

      if (scrollTop === 0) {
        content.current.scrollTo(0, 1);
      }
      if (scrollTop === bottom) {
        content.current.scrollTo(0, bottom - 1);
      }
    }
  }

  return (
    <div
      ref={background}
      className={clsx(styles.background, visible && styles.visible)}
      onClick={(e) => {
        if (e.target === background.current) {
          onCloseClick();
        }
      }}
    >
      <div className={styles.window}>
        {header && <header className={styles.header}>{header}</header>}
        {footer && <footer className={styles.footer}>{footer}</footer>}
        <div ref={content} className={styles.content} onScroll={adjustScroll}>
          {children}
        </div>
      </div>
    </div>
  );
}
