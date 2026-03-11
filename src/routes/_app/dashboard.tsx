import {
  Box,
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
import { createFileRoute, Link } from "@tanstack/react-router";

import { LinkButton } from "../../components/link-button.tsx";
import { UserAvatar } from "../../components/user-avatar.tsx";
import { QUICK_ACTIONS } from "../../features/dashboard/data/quick-actions.ts";
import { useAuth } from "../../lib/auth-context.tsx";
import { IconArrowRight, IconCalendar, IconMoon, IconSparkles, IconSun, IconSunrise } from "../../lib/icons.tsx";
import { getMyReservations } from "../../server/reservations.ts";

import styles from "./dashboard.module.css";

const QUICK_ACTION_ICON_BOX = rem(50);
// oxlint-disable-next-line no-magic-numbers -- UI icon size constant
const QUICK_ACTION_ICON_SIZE = rem(26);

export const Route = createFileRoute("/_app/dashboard")({
  loader: () => getMyReservations(),
  head: () => ({ meta: [{ title: "Dashboard | Adormable" }] }),
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
  const { name, image } = useAuth();
  const upcomingReservations = Route.useLoaderData();
  const greeting = getGreeting();
  const nextReservation = upcomingReservations[0] ?? null;

  return (
    <Container size="lg" py="xl" className="pageEnter">
      <Box className={styles.heroPanel} mb="xl">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid}>
          <Stack gap="md" className={styles.heroCopy}>
            <Group gap="sm" wrap="wrap">
              <Badge color="pink" variant="light" radius="xl" size="lg">
                Resident dashboard
              </Badge>
              <Badge color="grape" variant="light" radius="xl" leftSection={<IconSparkles size={14} />}>
                Daily overview
              </Badge>
            </Group>
            <Group gap="md" wrap="nowrap" align="center">
              <UserAvatar name={name} image={image} size={64} radius="xl" className={styles.heroAvatar} />
              <div>
                <Group gap="xs" mb={4}>
                  <greeting.Icon size={20} color="var(--mantine-color-pink-5)" />
                  <Text fw={700} className={styles.heroEyebrow}>
                    {greeting.text}
                  </Text>
                </Group>
                <Title order={1} className={styles.heroTitle}>
                  Welcome back, {name}.
                </Title>
              </div>
            </Group>
            <Text className={styles.heroDescription}>
              Your next booking, community shortcuts, and dorm essentials are all surfaced here so you can move from
              planning to action without hunting through the app.
            </Text>
            <Group gap="sm" wrap="wrap">
              <LinkButton color="pink" radius="xl" to="/study-nook" rightSection={<IconArrowRight size={16} />}>
                Reserve a study slot
              </LinkButton>
              <LinkButton variant="default" radius="xl" to="/lobby">
                Check the lobby
              </LinkButton>
            </Group>
            <Group gap="sm" wrap="wrap">
              <Paper radius="xl" px="md" py="xs" className={styles.heroMetricChip}>
                <Text size="xs" tt="uppercase" fw={700}>
                  Upcoming
                </Text>
                <Text size="sm" c="dimmed">
                  {upcomingReservations.length} active reservation{upcomingReservations.length === 1 ? "" : "s"}
                </Text>
              </Paper>
              <Paper radius="xl" px="md" py="xs" className={styles.heroMetricChip}>
                <Text size="xs" tt="uppercase" fw={700}>
                  Quick access
                </Text>
                <Text size="sm" c="dimmed">
                  Study nook, lobby, and guide in one tap
                </Text>
              </Paper>
            </Group>
          </Stack>

          <div className={styles.heroVisual}>
            <Paper radius="xl" p="lg" className={`${styles.heroCard} ${styles.heroCardPrimary}`}>
              <Text size="xs" tt="uppercase" fw={700} className={styles.cardLabel}>
                Next reservation
              </Text>
              {nextReservation == null ? (
                <>
                  <Title order={3}>No upcoming bookings yet</Title>
                  <Text size="sm" c="dimmed">
                    Open the study nook to find a quieter corner before the busy hours hit.
                  </Text>
                </>
              ) : (
                <>
                  <Title order={3}>{nextReservation.zone}</Title>
                  <Text size="sm" c="dimmed">
                    {nextReservation.date} · {nextReservation.time}
                  </Text>
                  <Badge color={nextReservation.status === "Confirmed" ? "green" : "yellow"} variant="light" mt="sm">
                    {nextReservation.status}
                  </Badge>
                </>
              )}
            </Paper>

            <Paper radius="xl" p="md" className={`${styles.heroCard} ${styles.heroCardSecondary}`}>
              <Text size="xs" tt="uppercase" fw={700} className={styles.cardLabel}>
                Today&apos;s rhythm
              </Text>
              <Text fw={700}>Best flow: book, discuss, then review.</Text>
              <Text size="sm" c="dimmed">
                Keep the dashboard as the launch point for reservation changes, lobby activity, and local spots.
              </Text>
            </Paper>

            <Paper radius="xl" p="md" className={`${styles.heroCard} ${styles.heroCardAccent}`}>
              <Text size="xs" tt="uppercase" fw={700} className={styles.cardLabel}>
                Fast lane
              </Text>
              <Text fw={700}>Manage your schedule</Text>
              <Text size="sm" c="dimmed">
                Use the profile page for edits and cancellations without leaving the resident flow.
              </Text>
            </Paper>
          </div>
        </div>
      </Box>

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
