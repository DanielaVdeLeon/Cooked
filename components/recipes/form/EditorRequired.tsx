import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import styles from "./EditorRequired.module.css";

/** Signed-in but without editor permission (AC-AUTH-002/007): explain,
    never imply login grants editing. */
export function EditorRequired() {
  return (
    <main>
      <EmptyState
        illustration="/assets/chef.svg"
        title="Editor access required"
        detail="Your account can browse and favourite recipes. Adding and editing recipes needs editor access, which is granted by an administrator."
      >
        <Link href="/" className={styles.homeLink}>
          Back to the recipes
        </Link>
      </EmptyState>
    </main>
  );
}
