import type { ReactNode } from "react";
import styles from "./AuthCard.module.css";

type AuthCardProps = {
  title: string;
  /** Login shows the chef illustration; the other auth screens don't. */
  withChef?: boolean;
  /** Step-blue title (reset screen) instead of ink. */
  blueTitle?: boolean;
  intro?: string;
  children: ReactNode;
  footnote?: ReactNode;
};

/** Brand-yellow construction-paper card used by the auth screens. */
export function AuthCard({
  title,
  withChef = false,
  blueTitle = false,
  intro,
  children,
  footnote,
}: AuthCardProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {withChef ? (
          // eslint-disable-next-line @next/next/no-img-element -- static illustration
          <img src="/assets/chef.svg" alt="" aria-hidden="true" className={styles.chef} />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- brand wordmark */}
        <img src="/assets/logo-no-icon.svg" alt="Cooked" className={styles.wordmark} />
        <h1 className={`${styles.title} ${blueTitle ? styles.titleBlue : ""}`}>{title}</h1>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
        {children}
      </div>
      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
    </div>
  );
}
