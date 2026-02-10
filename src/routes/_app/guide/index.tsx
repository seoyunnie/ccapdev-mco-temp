import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  TextInput,
  Group,
  Stack,
  Rating,
  Badge,
  Button,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { AppLink } from "../../../components/app-link.tsx";
import classes from "../../../styles/shared.module.css";

const establishments = [
  {
    id: "1",
    name: "Café Manila",
    category: "Coffee Shop",
    rating: 4.5,
    reviews: 32,
    description: "Cozy café with great drip coffee and pastries.",
  },
  {
    id: "2",
    name: "Kuya's Carinderia",
    category: "Filipino Food",
    rating: 4.2,
    reviews: 48,
    description: "Affordable and authentic Filipino dishes, just 2 minutes away.",
  },
  {
    id: "3",
    name: "Quick Prints",
    category: "Services",
    rating: 3.8,
    reviews: 15,
    description: "Fast printing and photocopy services, open late.",
  },
  {
    id: "4",
    name: "Samgyup Corner",
    category: "Korean BBQ",
    rating: 4.7,
    reviews: 61,
    description: "Unlimited samgyeopsal near the dorm. Student-friendly prices.",
  },
  {
    id: "5",
    name: "Laundry Express",
    category: "Services",
    rating: 3.5,
    reviews: 22,
    description: "Drop-off laundry service with same-day pickup available.",
  },
  {
    id: "6",
    name: "7-Eleven Taft",
    category: "Convenience Store",
    rating: 3.9,
    reviews: 10,
    description: "24/7 convenience store right next to the dorm entrance.",
  },
];

export const Route = createFileRoute("/_app/guide/")({ component: DirectoryListPage });

function DirectoryListPage() {
  const [search, setSearch] = useState("");

  const filtered = establishments.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Container size="lg" py="xl">
      <Title className={classes.pageTitle} mb="xs">
        The Survival Guide
      </Title>
      <Text c="dimmed" className={classes.pageDescription} mb="xl">
        Discover and review local establishments near your dormitory.
      </Text>

      <TextInput
        placeholder="Search establishments by name..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="xl"
        size="md"
      />

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {filtered.map((est) => (
          <Card key={est.id} shadow="md" padding="lg" radius="md" className={classes.card}>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={700} size="lg">
                  {est.name}
                </Text>
                <Badge variant="light">{est.category}</Badge>
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
              <Button variant="light" color="pink" fullWidth radius="xl" component={AppLink} to={`/guide/${est.id}`}>
                View Details
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
