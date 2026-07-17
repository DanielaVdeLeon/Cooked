import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import styles from "./Field.module.css";

type LabelledProps = {
  label: string;
  error?: string;
};

export const TextInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & LabelledProps
>(function TextInput({ label, error, id, className, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[styles.input, error ? styles.invalid : "", className ?? ""]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & LabelledProps
>(function TextArea({ label, error, id, className, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[styles.input, styles.textarea, error ? styles.invalid : "", className ?? ""]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & LabelledProps
>(function Select({ label, error, id, className, children, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <select
        ref={ref}
        id={inputId}
        className={[styles.input, styles.select, className ?? ""].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </select>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
});
