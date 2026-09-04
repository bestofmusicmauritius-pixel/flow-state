"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";

const components: Components = {
  h1: (props) => <h1 className="text-base font-semibold text-text-primary" {...props} />,
  h2: (props) => <h2 className="text-sm font-semibold text-text-primary" {...props} />,
  h3: (props) => <h3 className="text-sm font-semibold text-text-muted" {...props} />,
  p: (props) => <p className="text-text-muted" {...props} />,
  a: (props) => (
    <a
      className="text-accent underline hover:text-accent-hover"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  strong: (props) => <strong className="text-text-primary font-semibold" {...props} />,
  em: (props) => <em className="text-text-muted italic" {...props} />,
  ul: (props) => <ul className="list-disc list-inside text-text-muted" {...props} />,
  ol: (props) => <ol className="list-decimal list-inside text-text-muted" {...props} />,
  li: (props) => <li className="text-text-muted" {...props} />,
  code: ({ className, children, ...props }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return (
        <code
          className={clsx(
            "block bg-bg-base border border-border rounded-sm p-2 overflow-x-auto text-[12px] text-accent",
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="bg-bg-base border border-border rounded-sm px-1 text-accent text-[12px]" {...props}>
        {children}
      </code>
    );
  },
  pre: (props) => <pre className="my-1" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-2 border-border pl-2 text-text-faint italic" {...props} />
  ),
  hr: () => <hr className="border-border my-2" />,
  table: (props) => (
    <div className="overflow-x-auto">
      <table className="border-collapse text-text-muted" {...props} />
    </div>
  ),
  th: (props) => <th className="border border-border px-1.5 py-0.5 text-text-primary" {...props} />,
  td: (props) => <td className="border border-border px-1.5 py-0.5" {...props} />,
};

export function MarkdownPreview({ text }: { text: string }) {
  if (!text.trim()) {
    return <p className="font-mono text-xs text-text-faint py-2">$ nothing to preview</p>;
  }
  return (
    <div className="text-sm font-mono text-text-primary [&>*+*]:mt-2 max-h-48 overflow-y-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
