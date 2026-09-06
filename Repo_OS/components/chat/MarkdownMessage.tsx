"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark-dimmed.css";

export const MarkdownMessage = ({ text }: { text: string }) => (
  <div className="chat-markdown text-[12px] leading-relaxed">
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeHighlight]}>
      {text}
    </ReactMarkdown>
  </div>
);

const MS_PER_WORD = 28;

/** Reveals `text` word-by-word before rendering it as markdown, mimicking token streaming. Historical/instant messages should pass animate=false. */
const useTypewriter = (text: string, animate: boolean) => {
  const [revealed, setRevealed] = useState(animate ? "" : text);
  const started = useRef(false);

  useEffect(() => {
    if (!animate) {
      setRevealed(text);
      return;
    }
    if (started.current) return;
    started.current = true;

    const tokens = text.match(/\S+\s*/g) ?? [text];
    let i = 0;
    let acc = "";
    const id = setInterval(() => {
      if (i >= tokens.length) {
        clearInterval(id);
        return;
      }
      acc += tokens[i];
      i += 1;
      setRevealed(acc);
    }, MS_PER_WORD);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  return revealed;
};

export const StreamingMarkdown = ({ text, animate }: { text: string; animate: boolean }) => {
  const revealed = useTypewriter(text, animate);
  return <MarkdownMessage text={revealed} />;
};
