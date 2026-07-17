import { EmptyState } from "@/components/ui/EmptyState";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main>
      <div className={styles.titleRow}>
        <h1>Recipes</h1>
        <span aria-live="polite" className={styles.count}>
          0 recipes
        </span>
      </div>
      {/* Feed, search, filter, and sort arrive in milestone 2 (public read path). */}
      <EmptyState
        illustration="/assets/chef.svg"
        title="No recipes yet"
        detail="The library is empty. Recipes added by editors will appear here for everyone to browse."
      />
    </main>
  );
}
