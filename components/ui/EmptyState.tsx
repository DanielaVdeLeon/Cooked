import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  /** Illustration path under /assets, e.g. "/assets/vieja.svg". Decorative. */
  illustration: string;
  title: string;
  detail?: string;
  children?: ReactNode;
};

/** White card with a slightly rotated line illustration — used for
    “no search results”, empty library, and similar states. */
export function EmptyState({ illustration, title, detail, children }: EmptyStateProps) {
  return (
    <div className={styles.card}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static illustration */}
      <img src={illustration} alt="" aria-hidden="true" className={styles.illustration} />
      <p className={styles.title}>{title}</p>
      {detail ? <p className={styles.detail}>{detail}</p> : null}
      {children}
    </div>
  );
}
