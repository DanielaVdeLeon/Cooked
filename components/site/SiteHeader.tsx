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

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" aria-label="Cooked — home" className={styles.logo} onClick={onLogoClick}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG */}
          <img src="/assets/logo.svg" alt="Cooked" className={styles.logoImg} />
        </Link>
        <div className={styles.actions}>
          <button type="button" className={styles.login} onClick={onLogin}>
            Log in
          </button>
        </div>
      </div>
    </header>
  );
}
