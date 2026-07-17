import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.wordmark}>Cooked</span>
      </div>
    </footer>
  );
}
