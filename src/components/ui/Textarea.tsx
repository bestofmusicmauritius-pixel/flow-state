"use client";

import clsx from "clsx";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full bg-bg-base border border-border rounded-sm px-2.5 py-1.5 font-sans text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none",
        className
      )}
      {...props}
    />
  );
}
