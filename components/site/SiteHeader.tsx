"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { useToast } from "@/components/ui/Toast";
import styles from "./SiteHeader.module.css";

export type HeaderProfile = {
  displayName: string;
  initial: string;
  role: "viewer" | "editor" | "admin";
  isEditor: boolean;
};

const ROLE_LINES: Record<HeaderProfile["role"], string> = {
  viewer: "Viewer · can favourite recipes",
  editor: "Editor · can add and edit recipes",
  admin: "Admin · manages editors and content",
};

export function SiteHeader({ profile }: { profile: HeaderProfile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

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

  async function onLogout() {
    setMenuOpen(false);
    await logoutAction();
    showToast("Signed out");
    router.push("/");
    router.refresh();
  }

  // Recipe pages show a concise “‹ Back” header link (per the prototype) that
  // returns to the library preserving search, filters, and scroll state.
  const onRecipePage =
    pathname.startsWith("/recipes/") &&
    pathname !== "/recipes/new" &&
    !pathname.endsWith("/edit");

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
          {profile?.isEditor ? (
            onRecipePage ? (
              <Link href={`${pathname}/edit`} className={styles.editRecipe}>
                Edit recipe
              </Link>
            ) : (
              <Link href="/recipes/new" className={styles.addRecipe}>
                + Add recipe
              </Link>
            )
          ) : null}
          {profile ? (
            <div className={styles.accountWrap}>
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={menuOpen}
                className={styles.avatarButton}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className={styles.avatar}>{profile.initial}</span>
              </button>
              {menuOpen ? (
                <>
                  <div className={styles.scrim} onClick={() => setMenuOpen(false)} />
                  <div role="dialog" aria-label="Account" className={styles.menu}>
                    <div className={styles.menuUser}>
                      <span className={styles.menuAvatar}>{profile.initial}</span>
                      <div>
                        <p className={styles.menuName}>{profile.displayName}</p>
                        <p className={styles.menuRole}>{ROLE_LINES[profile.role]}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.settingsButton}
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/settings");
                      }}
                    >
                      Settings
                    </button>
                    <button type="button" className={styles.logoutButton} onClick={onLogout}>
                      Log out
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <button type="button" className={styles.login} onClick={onLogin}>
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
