import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "brand"
  | "danger"
  | "dangerOutline"
  | "text";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Stretch to the container width (login/form primary actions). */
  block?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", block = false, className, ...rest }, ref) {
    const classes = [styles.button, styles[variant], block ? styles.block : "", className ?? ""]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} className={classes} {...rest} />;
  },
);
