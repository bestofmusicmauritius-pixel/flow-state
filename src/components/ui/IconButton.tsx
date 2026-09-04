"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
}

export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center w-6 h-6 rounded-sm text-text-faint hover:text-text-primary hover:bg-bg-card transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
      {...props}
    />
  );
}
