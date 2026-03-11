export const CANONICAL_THREAD_TAGS = ["Discussion", "Issue", "Event", "Lost & Found"] as const;

export type CanonicalThreadTag = (typeof CANONICAL_THREAD_TAGS)[number];

const THREAD_TAG_ALIASES: Readonly<Record<string, CanonicalThreadTag>> = {
  announcement: "Event",
  announcements: "Event",
  discussion: "Discussion",
  event: "Event",
  events: "Event",
  food: "Discussion",
  general: "Discussion",
  issue: "Issue",
  issues: "Issue",
  lost: "Lost & Found",
  "lost & found": "Lost & Found",
  "lost-and-found": "Lost & Found",
  study: "Discussion",
  tip: "Discussion",
  tips: "Discussion",
};

export function normalizeThreadTag(tag?: string | null): CanonicalThreadTag {
  if (tag == null || tag.trim().length === 0) {
    return "Discussion";
  }

  const normalized = THREAD_TAG_ALIASES[tag.trim().toLowerCase()];
  if (normalized) {
    return normalized;
  }

  return CANONICAL_THREAD_TAGS.find((canonicalTag) => canonicalTag === tag) ?? "Discussion";
}
