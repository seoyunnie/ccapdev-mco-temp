import {
  Avatar,
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Button,
  Group,
  Stack,
  ThemeIcon,
  Badge,
  Paper,
  rem,
} from "@mantine/core";
import { IconCalendar, IconSun, IconMoon, IconSunrise } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import defaultAvatarFemale from "../../assets/avatars/default-avatar-female.svg";
import { useAuth } from "../../contexts/auth-context.tsx";
import { QUICK_ACTIONS } from "../../features/dashboard/data/quick-actions.ts";
import { getMyReservations } from "../../server/reservations.ts";

import styles from "./dashboard.module.css";

// oxlint-disable-next-line no-magic-numbers
const QUICK_ACTION_ICON_BOX = rem(50);
// oxlint-disable-next-line no-magic-numbers
const QUICK_ACTION_ICON_SIZE = rem(26);

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | Adormable" }] }),
  loader: () => getMyReservations(),
  component: DashboardPage,
});

const MORNING_START = 5;
const AFTERNOON_START = 12;
const EVENING_START = 17;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= MORNING_START && hour < AFTERNOON_START) {
    return { text: "Good morning", Icon: IconSunrise };
  }
  if (hour >= AFTERNOON_START && hour < EVENING_START) {
    return { text: "Good afternoon", Icon: IconSun };
  }
  return { text: "Good evening", Icon: IconMoon };
}

function DashboardPage() {
  const { name } = useAuth();
  const upcomingReservations = Route.useLoaderData();
  const greeting = getGreeting();

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="lg" radius="md" className={styles.welcomeBanner} mb="xl">
        <Group gap="md" wrap="nowrap">
          <Avatar src={defaultAvatarFemale} alt={name} size="lg" radius="xl" />
          <Stack gap={2}>
            <Group gap="xs">
              <greeting.Icon size={20} color="var(--mantine-color-pink-5)" />
              <Title order={2}>
                {greeting.text}, {name}!
              </Title>
            </Group>
            <Text c="dimmed">Here&apos;s a quick overview of your Adormable activity.</Text>
          </Stack>
        </Group>
      </Paper>

      <Text className={styles.sectionTitle} mb="md">
        Quick Actions
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        {QUICK_ACTIONS.map((action) => (
          <Card
            key={action.title}
            shadow="md"
            padding="xl"
            radius="md"
            className={styles.quickActionCard}
            component={Link}
            to={action.to}
          >
            <ThemeIcon size={QUICK_ACTION_ICON_BOX} radius="md" variant="light" color={action.color} mb="md">
              <action.iconComponent size={QUICK_ACTION_ICON_SIZE} stroke={1.5} />
            </ThemeIcon>
            <Text fz="lg" fw={500}>
              {action.title}
            </Text>
            <Text fz="sm" c="dimmed" mt="xs">
              {action.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Group gap="xs" mb="md">
        <IconCalendar size={20} />
        <Text className={styles.sectionTitle}>My Upcoming Reservations</Text>
      </Group>
      <Stack gap="sm">
        {upcomingReservations.map((res) => (
          <Paper key={res.id} withBorder p="md" radius="md" className={styles.reservationContainer}>
            <Group justify="space-between" wrap="wrap">
              <Stack gap={2}>
                <Text fw={600}>{res.zone}</Text>
                <Text size="sm" c="dimmed">
                  {res.date} · {res.time}
                </Text>
              </Stack>
              <Group>
                <Badge color={res.status === "Confirmed" ? "green" : "yellow"} variant="light">
                  {res.status}
                </Badge>
                <Button size="xs" variant="light" color="pink" radius="xl" component={Link} to="/profile">
                  Manage
                </Button>
              </Group>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
