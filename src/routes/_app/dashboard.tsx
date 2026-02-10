import {
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
import { IconBook, IconMessageCircle, IconStar, IconCalendar } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { AppLink } from "../../components/app-link.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import classes from "./dashboard.module.css";

const quickActions = [
  { icon: IconBook, title: "Book a Slot", description: "Reserve your study space", to: "/study-nook", color: "pink" },
  {
    icon: IconMessageCircle,
    title: "Post in Lobby",
    description: "Share with the community",
    to: "/lobby",
    color: "grape",
  },
  { icon: IconStar, title: "Write a Review", description: "Rate a local spot", to: "/guide", color: "teal" },
];

const upcomingReservations = [
  { zone: "Quiet Room A", date: "Feb 10, 2026", time: "2:00 PM - 4:00 PM", status: "Confirmed" },
  { zone: "Main Hall - Seat 12", date: "Feb 12, 2026", time: "10:00 AM - 12:00 PM", status: "Pending" },
];

export const Route = createFileRoute("/_app/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const { name } = useAuth();

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">
        Welcome back, {name}!
      </Title>
      <Text c="dimmed" mb="xl">
        Here's a quick overview of your Adormable activity.
      </Text>

      <Text className={classes.sectionTitle} mb="md">
        Quick Actions
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            shadow="md"
            padding="xl"
            radius="md"
            className={classes.quickActionCard}
            component={AppLink}
            to={action.to}
          >
            <ThemeIcon size={rem(50)} radius="md" variant="light" color={action.color} mb="md">
              <action.icon size={rem(26)} stroke={1.5} />
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
        <Text className={classes.sectionTitle}>My Upcoming Reservations</Text>
      </Group>
      <Stack gap="sm">
        {upcomingReservations.map((res, i) => (
          <Paper key={i} withBorder p="md" radius="md" className={classes.reservationPaper}>
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
                <Button size="xs" variant="light" color="pink" radius="xl">
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
