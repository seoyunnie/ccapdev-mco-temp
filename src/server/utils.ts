/**
 * Strip HTML tags from user input to prevent stored XSS.
 * React auto-escapes JSX, but this is defense-in-depth for the DB layer.
 */
export function sanitize(input: string): string {
  return input.replaceAll(/<[^>]*>/g, "").trim();
}

const DEFAULT_PAGE_SIZE = 20;
const LATIN_UPPERCASE_A = 65;
const LATIN_ALPHABET_SIZE = 26;

/** Clamp pagination params to safe bounds. */
export function clampPagination(page?: number, pageSize?: number): { page: number; pageSize: number } {
  const p = Math.max(1, Math.floor(page ?? 1));
  const ps = Math.min(100, Math.max(1, Math.floor(pageSize ?? DEFAULT_PAGE_SIZE)));
  return { page: p, pageSize: ps };
}

export function formatRelative(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) {
    return "just now";
  }
  if (mins < 60) {
    return `${mins} min ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function categorizeAction(action: string): string {
  if (action.includes("reservation") || action.includes("purge")) {
    return "Reservation";
  }
  if (action.includes("thread") || action.includes("comment")) {
    return "Forum";
  }
  if (action.includes("review")) {
    return "Review";
  }
  return "Admin";
}

function indexToLetters(index: number): string {
  let value = index;
  let result = "";
  do {
    result = String.fromCodePoint(LATIN_UPPERCASE_A + (value % LATIN_ALPHABET_SIZE)) + result;
    value = Math.floor(value / LATIN_ALPHABET_SIZE) - 1;
  } while (value >= 0);
  return result;
}

function isNumericSeatLabel(label: string): boolean {
  return /^\d+$/.test(label.trim());
}

function compareAlphaNumericLabels(left: string, right: string): number {
  const leftMatch = /^([A-Za-z]+)(\d+)$/.exec(left.trim());
  const rightMatch = /^([A-Za-z]+)(\d+)$/.exec(right.trim());
  if (leftMatch && rightMatch) {
    const rowCompare = leftMatch[1].localeCompare(rightMatch[1], undefined, { sensitivity: "base" });
    if (rowCompare !== 0) {
      return rowCompare;
    }
    return Number(leftMatch[2]) - Number(rightMatch[2]);
  }
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

export function normalizeSeatEntries<T extends { id: string; label: string }>(
  seats: T[],
  rowSize = 5,
): (T & { displayLabel: string; rowLabel: string; seatNumberLabel: string })[] {
  const numericOnly = seats.length > 0 && seats.every((seat) => isNumericSeatLabel(seat.label));
  // oxlint-disable-next-line unicorn/no-array-sort
  const sortedSeats = [...seats].sort((left: T, right: T) => {
    if (numericOnly) {
      return Number(left.label) - Number(right.label);
    }
    return compareAlphaNumericLabels(left.label, right.label);
  });

  const normalizedSeats: (T & { displayLabel: string; rowLabel: string; seatNumberLabel: string })[] = [];

  for (const [index, seat] of sortedSeats.entries()) {
    const displayLabel = numericOnly
      ? `${indexToLetters(Math.floor(index / rowSize))}${(index % rowSize) + 1}`
      : seat.label.trim().toUpperCase();
    const match = /^([A-Z]+)(.+)$/.exec(displayLabel);

    normalizedSeats.push({
      ...seat,
      displayLabel,
      rowLabel: match?.[1] ?? "",
      seatNumberLabel: match?.[2] ?? displayLabel,
    });
  }

  return normalizedSeats;
}

export function buildSeatLabelMap<T extends { id: string; label: string }>(
  seats: T[],
  rowSize = 5,
): Map<string, string> {
  return new Map(normalizeSeatEntries(seats, rowSize).map((seat) => [seat.id, seat.displayLabel]));
}

export async function logError(message: string, source?: string): Promise<void> {
  try {
    const { prisma } = await import("../db.ts");
    await prisma.errorLog.create({ data: { id: crypto.randomUUID(), level: "Error", message, source } });
  } catch {
    // Silently fail — logging should never crash the app
  }
}
