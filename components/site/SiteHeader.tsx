"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  function onLogoClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function onLogin() {
    const next = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    router.push(`/login${next}`);
  }

  // Recipe pages show a concise “‹ Back” header link (per the prototype) that
  // returns to the library preserving search, filters, and scroll state.
  const onRecipePage = pathname.startsWith("/recipes/");

  function onBack() {
    if (window.history.length > 2) router.back();
    else router.push("/");
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {onRecipePage ? (
          <button type="button" className={styles.back} onClick={onBack}>
            ‹ Back
          </button>
        ) : (
          <Link href="/" aria-label="Cooked — home" className={styles.logo} onClick={onLogoClick}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG */}
            <img src="/assets/logo.svg" alt="Cooked" className={styles.logoImg} />
          </Link>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.login} onClick={onLogin}>
            Log in
          </button>
        </div>
      </div>
    </header>
  );
}
