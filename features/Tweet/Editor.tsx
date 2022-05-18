import { useEffect, useRef, useState } from 'react';
import styles from './Editor.module.css';

type Props = {
  baseText: string;
  onChange(planeText: string): void;
};

export default function Editor(props: Props) {
  const { baseText } = props;
  const container = useRef<HTMLDivElement>(null);
  const [text] = useState(baseText);

  useEffect(() => {
    container.current?.focus();
  }, [container]);

  return (
    <div
      contentEditable={false}
      ref={container}
      className={styles.container}
      onChange={(e) => console.log(e)}
    >
      {text}
    </div>
  );
}
