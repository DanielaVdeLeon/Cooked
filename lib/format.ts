/** "45 min", "3 hr", "3 hr 30 min" — used for cards, meta strips, timers. */
export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/** "12 March 2026" — note bylines and date displays. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Ingredient amount column: quantity + unit ("1.2 kg", "2 tbsp", "1"). */
export function formatAmount(quantity: string, unit: string): string {
  return [quantity, unit].filter(Boolean).join(" ");
}

/** Recipe yield for cards and metadata. Bare quantities default to servings;
    explicit "Serves" and "Makes" wording is kept and normalized. */
export function formatYield(value: string | null | undefined): string {
  const text = value?.trim() ?? "";
  if (!text) return "";

  const explicit = text.match(/^(serves?|makes?)\b(.*)$/i);
  if (!explicit) return `Serves ${text}`;

  const verb = explicit[1].toLowerCase().startsWith("make") ? "Makes" : "Serves";
  const amount = explicit[2].trim();
  return amount ? `${verb} ${amount}` : verb;
}

/** Accept a quantity-first yield or a complete phrase beginning with Serves/Makes. */
export function isValidYieldInput(value: string): boolean {
  const text = value.trim();
  return (
    text === "" ||
    /^\d/.test(text) ||
    /^(?:serves?|makes?)\s+\S/i.test(text)
  );
}
