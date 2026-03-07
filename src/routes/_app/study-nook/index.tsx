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
import { SearchBar } from "../../../components/search-bar.tsx";
import { SectionHeader } from "../../../components/section-header.tsx";

import imgStyles from "../../../components/shared-images.module.css";

const zones = [
  { id: "main-hall", name: "Main Hall", capacity: 40, available: 12, status: "Open", image: mainHall },
  { id: "quiet-room-a", name: "Quiet Room A", capacity: 10, available: 3, status: "Open", image: quietRoomA },
  { id: "quiet-room-b", name: "Quiet Room B", capacity: 10, available: 0, status: "Full", image: quietRoomB },
  { id: "group-study", name: "Group Study Room", capacity: 20, available: 8, status: "Open", image: groupStudy },
  { id: "computer-lab", name: "Computer Lab", capacity: 30, available: 15, status: "Open", image: computerLab },
  { id: "reading-room", name: "Reading Room", capacity: 15, available: 0, status: "Full", image: readingRoom },
];

export const Route = createFileRoute("/_app/study-nook/")({
  head: () => ({ meta: [{ title: "Study Nook | Adormable" }] }),
  component: ZoneSelectionPage,
});

function ZoneSelectionPage() {
  const [search, setSearch] = useState("");

  const filtered = zones.filter((z) => z.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Container size="lg" py="xl">
      <SectionHeader title="The Study Nook" description="Choose a zone to reserve your study spot." color="pink" />

      <SearchBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search zones..." />

      {filtered.length === 0 && <EmptyState image={emptyState} message="No zones match your search." />}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {filtered.map((zone) => {
          const pct = ((zone.capacity - zone.available) / zone.capacity) * 100;
          return (
            <Card key={zone.id} shadow="md" padding="lg" radius="md" className="content-card">
              <img src={zone.image} alt={zone.name} className={imgStyles.cardImage} />
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
                {/* oxlint-disable-next-line unicorn/no-nested-ternary */}
                <Progress value={pct} color={pct > 80 ? "red" : pct > 50 ? "yellow" : "green"} size="sm" />
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
    </Container>
  );
}
