export const ESTABLISHMENT_CATEGORIES = [
  "Cafe & Coffee",
  "Restaurants",
  "Essentials",
  "Services",
  "Study Spots",
] as const;

export type EstablishmentCategory = (typeof ESTABLISHMENT_CATEGORIES)[number];

const ESTABLISHMENT_CATEGORY_ALIASES: Readonly<Record<string, EstablishmentCategory>> = {
  "cafe & coffee": "Cafe & Coffee",
  "coffee shop": "Cafe & Coffee",
  convenience: "Essentials",
  "convenience store": "Essentials",
  essentials: "Essentials",
  filipino: "Restaurants",
  "filipino food": "Restaurants",
  grocery: "Essentials",
  groceries: "Essentials",
  "korean bbq": "Restaurants",
  restaurant: "Restaurants",
  restaurants: "Restaurants",
  service: "Services",
  services: "Services",
  study: "Study Spots",
  "study spot": "Study Spots",
  "study spots": "Study Spots",
};

export function normalizeEstablishmentCategory(category?: string | null): EstablishmentCategory {
  if (category == null || category.trim().length === 0) {
    return "Services";
  }

  const normalized = ESTABLISHMENT_CATEGORY_ALIASES[category.trim().toLowerCase()];
  if (normalized) {
    return normalized;
  }

  return ESTABLISHMENT_CATEGORIES.find((establishmentCategory) => establishmentCategory === category) ?? "Services";
}
