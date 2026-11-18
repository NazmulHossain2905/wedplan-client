export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Read a File as a data URL (for demo image upload previews). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Format a number as Bangladeshi Taka with lakh grouping (৳1,20,000). */
export function formatBDT(amount: number): string {
  return `৳${new Intl.NumberFormat("en-IN").format(amount)}`;
}

/** Simple debounce helper. */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
