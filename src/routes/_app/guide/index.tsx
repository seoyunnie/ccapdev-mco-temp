import {
  Container,
  Text,
  Card,
  SimpleGrid,
  Group,
  Stack,
  Rating,
  Badge,
  Chip,
  Pagination,
  ThemeIcon,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import { EmptyState } from "../../../components/empty-state.tsx";
import { LinkButton } from "../../../components/link-button.tsx";
import { PageSkeleton } from "../../../components/page-skeleton.tsx";
import { SearchBar } from "../../../components/search-bar.tsx";
import { SectionHeader } from "../../../components/section-header.tsx";
import {
  FALLBACK_GUIDE_CATEGORY_ICON,
  GUIDE_CATEGORY_COLORS,
  GUIDE_CATEGORY_ICONS,
} from "../../../features/guide/guide.constants.ts";
import { ESTABLISHMENT_CATEGORIES } from "../../../features/guide/guide.taxonomy.ts";
import { getEstablishments } from "../../../server/establishments.ts";

import imgStyles from "../../../components/shared-images.module.css";
import styles from "./index.module.css";

const ALL_CATEGORIES = ["All", ...ESTABLISHMENT_CATEGORIES] as const;

export const Route = createFileRoute("/_app/guide/")({
  loader: () => getEstablishments({ data: {} }),
  head: () => ({ meta: [{ title: "Survival Guide | Adormable" }] }),
  pendingComponent: PageSkeleton,
  component: DirectoryListPage,
});

function DirectoryListPage() {
  const result = Route.useLoaderData();
  const establishments = result.items;
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = establishments.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container size="lg" py="xl" className="pageEnter">
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
            <Chip
              key={cat}
              value={cat}
              variant="light"
              color={cat === "All" ? "gray" : GUIDE_CATEGORY_COLORS[cat]}
              size="sm"
            >
              {cat}
            </Chip>
          ))}
        </Group>
      </Chip.Group>

      {filtered.length === 0 && <EmptyState image={emptyState} message="No establishments match your search." />}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {filtered.map((est) => (
          <Card key={est.id} shadow="md" padding="lg" radius="md" className={styles.estCard}>
            <div className={styles.estMedia}>
              <img
                src={est.image ?? GUIDE_CATEGORY_ICONS[est.category] ?? FALLBACK_GUIDE_CATEGORY_ICON}
                alt={est.name}
                className={imgStyles.cardImage}
              />
            </div>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={700} size="lg">
                  {est.name}
                </Text>
                <Badge
                  className={styles.estBadge}
                  variant="light"
                  color={GUIDE_CATEGORY_COLORS[est.category] ?? "gray"}
                  leftSection={
                    GUIDE_CATEGORY_ICONS[est.category] ? (
                      <img src={GUIDE_CATEGORY_ICONS[est.category]} alt="" width={14} height={14} />
                    ) : undefined
                  }
                >
                  {est.category}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={2}>
                {est.description}
              </Text>
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <ThemeIcon
                    variant="light"
                    color={GUIDE_CATEGORY_COLORS[est.category] ?? "gray"}
                    radius="xl"
                    size="sm"
                  >
                    <img
                      src={GUIDE_CATEGORY_ICONS[est.category] ?? FALLBACK_GUIDE_CATEGORY_ICON}
                      alt=""
                      width={14}
                      height={14}
                    />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed" className={styles.estMetaText}>
                    {est.address}
                  </Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {est.owner}
                </Text>
              </Group>
              <Group justify="space-between" align="center" className={styles.estFooter}>
                <Group gap="xs">
                  <Rating value={est.rating} fractions={2} readOnly size="sm" />
                  <Text size="sm" c="dimmed">
                    ({est.reviews} reviews)
                  </Text>
                </Group>
                <LinkButton variant="light" color="teal" radius="xl" to="/guide/$estId" params={{ estId: est.id }}>
                  View Details
                </LinkButton>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {result.total > result.pageSize && (
        <Group justify="center" mt="xl">
          <Pagination total={Math.ceil(result.total / result.pageSize)} value={result.page} color="teal" />
        </Group>
      )}
    </Container>
  );
}
