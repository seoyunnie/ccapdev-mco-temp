export interface Stat {
  readonly label: string;
  readonly description: string;
  readonly value: string | number;
}

export const STATS: readonly Stat[] = [
  { value: "500+", label: "Happy Residents", description: "Active users across all dormitory buildings" },
  { value: "50+", label: "Study Spots", description: "Reservable spaces with real-time availability" },
  { value: "200+", label: "Reviews", description: "Honest community ratings of local establishments" },
];
