import { useEffect, useRef, useState } from 'react';
import parse from 'html-react-parser';
import styles from './Editor.module.css';

type Props = {
  base: string;
};

export default function Editor(props: Props) {
  const { base } = props;
  const editor = useRef<HTMLDivElement>(null);
  const [observer, setObserver] = useState<MutationObserver>();
  const [html, setHtml] = useState(base);

  useEffect(() => {
    setObserver(new MutationObserver(observe));
    return () => observer && observer.disconnect();
  }, []);

  useEffect(() => {
    if (observer && editor.current) {
      observer.observe(editor.current);
    }
  }, [editor]);

  function observe(list: MutationRecord[]) {
    console.log(list);
    setHtml(editor.current?.innerHTML ?? html);
  }

  return (
    <div contentEditable ref={editor} className={styles.container}>
      {parse(html)}
    </div>
  );
}
