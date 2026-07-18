import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetRequestForm } from "@/components/auth/ResetRequestForm";
import styles from "@/components/auth/auth-forms.module.css";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <main>
      <div className={styles.backRow}>
        <Link href="/login" className={styles.backLink}>
          ‹ Back to log in
        </Link>
      </div>
      <AuthCard
        title="Reset password"
        blueTitle
        intro="Enter the email on your account and we’ll send you a reset link."
      >
        <ResetRequestForm />
      </AuthCard>
    </main>
  );
}
