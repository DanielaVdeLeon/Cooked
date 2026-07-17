import styles from "./loading.module.css";

/** Library loading state: ghost cards on the paper background. */
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading recipes">
      <div className={styles.titleRow}>
        <div className={styles.ghostTitle} />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.ghostCard}>
            <div className={styles.ghostPhoto} />
            <div className={styles.ghostLineWide} />
            <div className={styles.ghostLine} />
          </div>
        ))}
      </div>
    </main>
  );
}
