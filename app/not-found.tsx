import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import styles from "./not-found.module.css";

/** Deleted/unknown recipe or wrong URL — the “unavailable” state. */
export default function NotFound() {
  return (
    <main>
      <EmptyState
        illustration="/assets/vieja.svg"
        title="Nothing at this address"
        detail="This recipe may have been deleted, or the link is wrong."
      >
        <Link href="/" className={styles.homeLink}>
          Back to the recipes
        </Link>
      </EmptyState>
    </main>
  );
}
