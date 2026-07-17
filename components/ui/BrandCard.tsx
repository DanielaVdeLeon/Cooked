import type { HTMLAttributes } from "react";
import styles from "./BrandCard.module.css";

type BrandCardProps = HTMLAttributes<HTMLDivElement> & {
  /** blue = recipe cards / title strips; yellow = login & reset card. */
  tone?: "blue" | "yellow";
};

/** Construction-paper brand surface: texture multiplied in, 3px radius,
    hard offset shadow. Reading and input content inside stays flat. */
export function BrandCard({ tone = "blue", className, ...rest }: BrandCardProps) {
  const classes = [styles.card, styles[tone], className ?? ""].filter(Boolean).join(" ");
  return <div className={classes} {...rest} />;
}
