import type { DefaultMantineColor } from "@mantine/core";

import catCoffeeShop from "../../assets/establishments/cat-coffee-shop.svg";
import catConvenienceStore from "../../assets/establishments/cat-convenience-store.svg";
import catFilipinoFood from "../../assets/establishments/cat-filipino-food.svg";
import catServices from "../../assets/establishments/cat-services.svg";

export const GUIDE_CATEGORY_ICONS: Readonly<Record<string, string>> = {
  "Cafe & Coffee": catCoffeeShop,
  Restaurants: catFilipinoFood,
  Essentials: catConvenienceStore,
  Services: catServices,
  "Study Spots": catServices,
};

export const GUIDE_CATEGORY_COLORS: Readonly<Record<string, DefaultMantineColor>> = {
  "Cafe & Coffee": "orange",
  Restaurants: "red",
  Essentials: "cyan",
  Services: "blue",
  "Study Spots": "pink",
};

export const FALLBACK_GUIDE_CATEGORY_ICON = catServices;
