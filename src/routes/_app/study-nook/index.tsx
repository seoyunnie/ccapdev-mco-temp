import { Container, Text, SimpleGrid, Card, Badge, Group, Stack, Button, Progress } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import computerLab from "../../../assets/study-nook/computer-lab.svg";
import groupStudy from "../../../assets/study-nook/group-study.svg";
import mainHall from "../../../assets/study-nook/main-hall.svg";
import quietRoomA from "../../../assets/study-nook/quiet-room-a.svg";
import quietRoomB from "../../../assets/study-nook/quiet-room-b.svg";
import readingRoom from "../../../assets/study-nook/reading-room.svg";
import { EmptyState } from "../../../components/empty-state.tsx";
import { FadeInSection } from "../../../components/fade-in-section.tsx";
import { PageSkeleton } from "../../../components/page-skeleton.tsx";
import { SearchBar } from "../../../components/search-bar.tsx";
import { SectionHeader } from "../../../components/section-header.tsx";
import { getZones } from "../../../server/zones.ts";

import imgStyles from "../../../components/shared-images.module.css";

const TO_PERCENT = 100;
const HIGH_OCCUPANCY_PCT = 80;
const MED_OCCUPANCY_PCT = 50;

const ZONE_IMAGES: Record<string, string> = {
  "Main Hall": mainHall,
  "Quiet Room A": quietRoomA,
  "Quiet Room B": quietRoomB,
  "Group Study Room": groupStudy,
  "Computer Lab": computerLab,
  "Reading Room": readingRoom,
};

function getOccupancyColor(pct: number): string {
  if (pct > HIGH_OCCUPANCY_PCT) {
    return "red";
  }
  if (pct > MED_OCCUPANCY_PCT) {
    return "yellow";
  }
  return "green";
}

export const Route = createFileRoute("/_app/study-nook/")({
  loader: () => getZones(),
  head: () => ({ meta: [{ title: "Study Nook | Adormable" }] }),
  pendingComponent: PageSkeleton,
  component: ZoneSelectionPage,
});

function ZoneSelectionPage() {
  const zones = Route.useLoaderData();
  const [search, setSearch] = useState("");

  const filtered = zones.filter((z) => z.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Container size="lg" py="xl" className="pageEnter">
      <SectionHeader title="The Study Nook" description="Choose a zone to reserve your study spot." color="pink" />

      <SearchBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search zones..." />

      {filtered.length === 0 && <EmptyState image={emptyState} message="No zones match your search." />}

      <FadeInSection>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {filtered.map((zone) => {
            const pct = ((zone.capacity - zone.available) / zone.capacity) * TO_PERCENT;
            return (
              <Card key={zone.id} shadow="md" padding="lg" radius="md" className="content-card">
                <img
                  src={zone.image ?? ZONE_IMAGES[zone.name] ?? mainHall}
                  alt={zone.name}
                  className={imgStyles.cardImage}
                />
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600} size="lg">
                      {zone.name}
                    </Text>
                    <Badge color={zone.status === "Open" ? "green" : "red"} variant="light">
                      {zone.status}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {zone.available} / {zone.capacity} seats available
                  </Text>
                  <Progress value={pct} color={getOccupancyColor(pct)} size="sm" />
                  <Button
                    fullWidth
                    color="pink"
                    radius="xl"
                    component={Link}
                    to={`/study-nook/${zone.id}`}
                    disabled={zone.status === "Full"}
                  >
                    {zone.status === "Full" ? "No Spots Available" : "View & Reserve"}
                  </Button>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </FadeInSection>
    </Container>
  );
}
