import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import usePropChange from 'lib/usePropChange';
import isInnerNode from 'lib/isInnerNode';
import styles from './index.module.css';

type Props = {
  visible: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  onCloseClick(): void;
};

export default function Modal(props: Props) {
  const { header, footer, visible, children, onCloseClick } = props;
  const background = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);

  usePropChange(visible, (nextProp) => {
    if (nextProp) {
      content.current?.scrollTo(0, 1);
      setPosition(
        document.body.scrollTop || document.documentElement.scrollTop,
      );
    } else {
      window.scrollTo(0, position);
    }
  });

  useEffect(
    function onMount() {
      if (content.current) {
        window.addEventListener('touchmove', preventBehindScroll);
        content.current.addEventListener('scroll', adjustScroll);
        return () => {
          if (content.current) {
            window.removeEventListener('touchmove', preventBehindScroll);
            content.current.removeEventListener('scroll', adjustScroll);
          }
        };
      }
    },
    [content],
  );

  function adjustScroll() {
    if (content.current) {
      const position = content.current.scrollTop;
      const bottom =
        content.current.scrollHeight - content.current.clientHeight;
      if (position === 0) {
        content.current.scrollTo(0, 1);
      }
      if (position === bottom) {
        content.current.scrollTo(0, bottom - 1);
      }
    }
  }

  function preventBehindScroll(e: TouchEvent) {
    if (content.current && background.current && e.target) {
      const bottom =
        content.current.scrollHeight - content.current.clientHeight;

      if (visible) {
        if (isInnerNode(background.current, e.target)) {
          e.stopPropagation();
        } else if (
          content.current.scrollTop === 0 ||
          content.current.scrollTop === bottom
        ) {
          e.preventDefault();
        }
      }
    }
  }

  return (
    <div
      ref={background}
      className={clsx(styles.background, { [styles.visible]: visible })}
      onClick={onCloseClick}
    >
      <div className={clsx(styles.window, { [styles.visible]: visible })}>
        {header && <header className={styles.header}>{header}</header>}
        {footer && <footer className={styles.footer}>{footer}</footer>}
        <div ref={content} className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
