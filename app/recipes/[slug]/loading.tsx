import styles from "./loading.module.css";

export default function LoadingRecipe() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Loading recipe">
      <div className={`${styles.skeleton} ${styles.title}`} />
      <div className={`${styles.skeleton} ${styles.description}`} />
      <div className={styles.chips}>
        <span className={`${styles.skeleton} ${styles.chip}`} />
        <span className={`${styles.skeleton} ${styles.chip}`} />
        <span className={`${styles.skeleton} ${styles.chip}`} />
      </div>
      <div className={`${styles.skeleton} ${styles.photo}`} />
      <div className={`${styles.skeleton} ${styles.meta}`} />
      <div className={styles.columns}>
        <div className={`${styles.skeleton} ${styles.panel}`} />
        <div className={`${styles.skeleton} ${styles.panel}`} />
      </div>
      <span className={styles.srOnly}>Loading recipe…</span>
    </main>
  );
}
