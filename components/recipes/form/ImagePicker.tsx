"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./ImagePicker.module.css";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function publicImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`;
}

type ImagePickerProps = {
  imagePath: string | null;
  onChange: (path: string | null) => void;
};

/** Uploads straight to the recipe-images bucket (editor-only via storage
    policies) with uploading/failure states per the required interface states. */
export function ImagePicker({ imagePath, onChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setError(null);
    const ext = ALLOWED.get(file.type);
    if (!ext) {
      setError("Photos must be JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Photos must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    const path = `${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(path, file, { contentType: file.type });
    setUploading(false);

    if (uploadError) {
      setError("Upload failed. Check your connection and try again.");
      return;
    }
    onChange(path);
  }

  return (
    <div>
      <div className={styles.frame}>
        {imagePath ? (
          // eslint-disable-next-line @next/next/no-img-element -- freshly uploaded photo preview
          <img src={publicImageUrl(imagePath)} alt="Recipe photo preview" className={styles.preview} />
        ) : (
          <button
            type="button"
            className={styles.dropButton}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Add a recipe photo"}
          </button>
        )}
        {uploading ? (
          <div className={styles.progress} role="status" aria-label="Uploading photo">
            <div className={styles.progressBar} />
          </div>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
      <div className={styles.actions}>
        {imagePath ? (
          <>
            <button
              type="button"
              className={styles.replace}
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Replace photo
            </button>
            <button
              type="button"
              className={styles.remove}
              onClick={() => onChange(null)}
              disabled={uploading}
            >
              Remove photo
            </button>
          </>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.fileInput}
        aria-label="Choose a recipe photo"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
