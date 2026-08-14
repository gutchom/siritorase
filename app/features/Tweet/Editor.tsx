import { useEffect, useRef, useState } from 'react';
import styles from './Editor.module.css';

type Props = {
  base: string;
};

export default function Editor(props: Props) {
  const { base } = props;
  const editor = useRef<HTMLDivElement>(null);
  const [observer, setObserver] = useState<MutationObserver>();
  const [, setHtml] = useState(base);

  useEffect(() => {
    setObserver(new MutationObserver(observe));
    return () => observer && observer.disconnect();
  }, []);

  useEffect(() => {
    if (observer && editor.current) {
      observer.observe(editor.current, { childList: true, characterData: true, subtree: true });
    }
  }, [editor]);

  function observe() {
    setHtml(editor.current?.innerHTML ?? base);
  }

  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: baseはtwitter-textのautoLinkで生成した信頼できるHTML
    <div
      contentEditable
      ref={editor}
      className={styles.container}
      dangerouslySetInnerHTML={{ __html: base }}
    />
  );
}
