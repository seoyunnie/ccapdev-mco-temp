import { Container, Text, Card, SimpleGrid, Group, Stack, Rating, Badge, Button, Chip } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import cafeManila from "../../../assets/establishments/1-cafe-manila.svg";
import kuyasCarinderia from "../../../assets/establishments/2-kuyas-carinderia.svg";
import quickPrints from "../../../assets/establishments/3-quick-prints.svg";
import samgyupCorner from "../../../assets/establishments/4-samgyup-corner.svg";
import laundryExpress from "../../../assets/establishments/5-laundry-express.svg";
import sevenElevenTaft from "../../../assets/establishments/6-7-eleven-taft.svg";
import catCoffeeShop from "../../../assets/establishments/cat-coffee-shop.svg";
import catConvenienceStore from "../../../assets/establishments/cat-convenience-store.svg";
import catFilipinoFood from "../../../assets/establishments/cat-filipino-food.svg";
import catKoreanBbq from "../../../assets/establishments/cat-korean-bbq.svg";
import catServices from "../../../assets/establishments/cat-services.svg";
import emptyState from "../../../assets/features/empty-state.svg";
import { EmptyState } from "../../../components/empty-state.tsx";
import { SearchBar } from "../../../components/search-bar.tsx";
import { SectionHeader } from "../../../components/section-header.tsx";

import imgStyles from "../../../components/shared-images.module.css";
import styles from "./index.module.css";

const CATEGORY_ICONS: Record<string, string> = {
  "Coffee Shop": catCoffeeShop,
  "Filipino Food": catFilipinoFood,
  Services: catServices,
  "Korean BBQ": catKoreanBbq,
  "Convenience Store": catConvenienceStore,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Coffee Shop": "orange",
  "Filipino Food": "red",
  Services: "blue",
  "Korean BBQ": "pink",
  "Convenience Store": "cyan",
};

const ALL_CATEGORIES = ["All", "Coffee Shop", "Filipino Food", "Services", "Korean BBQ", "Convenience Store"] as const;

const establishments = [
  {
    id: "1",
    name: "Café Manila",
    category: "Coffee Shop",
    rating: 4.5,
    reviews: 32,
    description: "Cozy café with great drip coffee and pastries.",
    image: cafeManila,
  },
  {
    id: "2",
    name: "Kuya's Carinderia",
    category: "Filipino Food",
    rating: 4.2,
    reviews: 48,
    description: "Affordable and authentic Filipino dishes, just 2 minutes away.",
    image: kuyasCarinderia,
  },
  {
    id: "3",
    name: "Quick Prints",
    category: "Services",
    rating: 3.8,
    reviews: 15,
    description: "Fast printing and photocopy services, open late.",
    image: quickPrints,
  },
  {
    id: "4",
    name: "Samgyup Corner",
    category: "Korean BBQ",
    rating: 4.7,
    reviews: 61,
    description: "Unlimited samgyeopsal near the dorm. Student-friendly prices.",
    image: samgyupCorner,
  },
  {
    id: "5",
    name: "Laundry Express",
    category: "Services",
    rating: 3.5,
    reviews: 22,
    description: "Drop-off laundry service with same-day pickup available.",
    image: laundryExpress,
  },
  {
    id: "6",
    name: "7-Eleven Taft",
    category: "Convenience Store",
    rating: 3.9,
    reviews: 10,
    description: "24/7 convenience store right next to the dorm entrance.",
    image: sevenElevenTaft,
  },
];

export const Route = createFileRoute("/_app/guide/")({
  head: () => ({ meta: [{ title: "Survival Guide | Adormable" }] }),
  component: DirectoryListPage,
});

function DirectoryListPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = establishments.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container size="lg" py="xl">
      <SectionHeader
        title="The Survival Guide"
        description="Discover and review local establishments near your dormitory."
        color="teal"
      />

      <SearchBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search establishments by name..." />

      <Chip.Group
        value={activeCategory}
        onChange={(v) => {
          if (typeof v === "string") {
            setActiveCategory(v);
          }
        }}
      >
        <Group gap="xs" mb="lg">
          {ALL_CATEGORIES.map((cat) => (
            <Chip key={cat} value={cat} variant="light" color={cat === "All" ? "gray" : CATEGORY_COLORS[cat]} size="sm">
              {cat}
            </Chip>
          ))}
        </Group>
      </Chip.Group>

      {filtered.length === 0 && <EmptyState image={emptyState} message="No establishments match your search." />}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {filtered.map((est) => (
          <Card key={est.id} shadow="md" padding="lg" radius="md" className={styles.estCard}>
            <img src={est.image} alt={est.name} className={imgStyles.cardImage} />
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={700} size="lg">
                  {est.name}
                </Text>
                <Badge
                  variant="light"
                  color={CATEGORY_COLORS[est.category]}
                  leftSection={
                    CATEGORY_ICONS[est.category] ? (
                      <img src={CATEGORY_ICONS[est.category]} alt="" width={14} height={14} />
                    ) : undefined
                  }
                >
                  {est.category}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={2}>
                {est.description}
              </Text>
              <Group gap="xs">
                <Rating value={est.rating} fractions={2} readOnly size="sm" />
                <Text size="sm" c="dimmed">
                  ({est.reviews} reviews)
                </Text>
              </Group>
              <Button variant="light" color="teal" fullWidth radius="xl" component={Link} to={`/guide/${est.id}`}>
                View Details
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
