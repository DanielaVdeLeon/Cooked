import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./TagChip.module.css";

type TagChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** Render as a static span (e.g. inside a link card where chips are inert). */
  asSpan?: boolean;
};

/** Cardboard-textured yellow paper chip — the one scrapbook element allowed
    inside content. Interactive by default (filters by tag). */
export function TagChip({ children, asSpan = false, className, ...rest }: TagChipProps) {
  const classes = [styles.chip, className ?? ""].filter(Boolean).join(" ");
  if (asSpan) {
    return <span className={classes}>{children}</span>;
  }
  return (
    <button type="button" className={`${classes} ${styles.interactive}`} {...rest}>
      {children}
    </button>
  );
}
