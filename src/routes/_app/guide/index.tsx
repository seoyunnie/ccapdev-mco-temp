import { Container, Text, Card, SimpleGrid, Group, Stack, Rating, Badge, Button, Chip } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

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

import { getEstablishments } from "../../../server/establishments.ts";

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

export const Route = createFileRoute("/_app/guide/")({
  head: () => ({ meta: [{ title: "Survival Guide | Adormable" }] }),
  loader: () => getEstablishments(),
  component: DirectoryListPage,
});

function DirectoryListPage() {
  const establishments = Route.useLoaderData();
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
            <img
              src={CATEGORY_ICONS[est.category] ?? catServices}
              alt={est.name}
              className={imgStyles.cardImage}
            />
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={700} size="lg">
                  {est.name}
                </Text>
                <Badge
                  variant="light"
                  color={CATEGORY_COLORS[est.category] ?? "gray"}
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
