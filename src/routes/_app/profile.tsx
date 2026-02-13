import {
  Container,
  Title,
  Text,
  Tabs,
  Paper,
  Group,
  Stack,
  Avatar,
  TextInput,
  Textarea,
  Button,
  Badge,
  Table,
  ActionIcon,
} from "@mantine/core";
import { IconUser, IconCalendar, IconHistory, IconEdit, IconTrash, IconCamera } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import classes from "../../styles/shared.module.css";

const reservations = [
  { zone: "Quiet Room A", date: "Feb 10, 2026", time: "2:00 PM – 4:00 PM", status: "Confirmed" },
  { zone: "Main Hall – Seat 12", date: "Feb 12, 2026", time: "10:00 AM – 12:00 PM", status: "Pending" },
];

const activityHistory = [
  { action: "Booked Quiet Room A", date: "Feb 8, 2026", type: "Reservation" },
  { action: "Posted in Virtual Lobby", date: "Feb 7, 2026", type: "Forum" },
  { action: "Reviewed Café Manila (5★)", date: "Feb 5, 2026", type: "Review" },
  { action: "Upvoted 'Wi-Fi Issues'", date: "Feb 4, 2026", type: "Forum" },
];

const typeColors: Record<string, string> = { Reservation: "pink", Forum: "grape", Review: "teal" };

export const Route = createFileRoute("/_app/profile")({ component: UserProfilePage });

function UserProfilePage() {
  return (
    <Container size="md" py="xl">
      <Title className={classes.pageTitle} mb="xl">
        My Profile
      </Title>

      <Paper shadow="md" p="lg" radius="md" className={classes.contentCard} mb="xl">
        <Group wrap="wrap">
          <Stack align="center">
            <Avatar size={100} radius="xl" color="pink">
              MS
            </Avatar>
            <Button variant="light" color="pink" size="xs" leftSection={<IconCamera size={14} />}>
              Change Photo
            </Button>
          </Stack>
          <Stack style={{ flex: 1 }} gap="sm">
            <TextInput label="Display Name" defaultValue="Maria Santos" />
            <Textarea label="Bio" defaultValue="3rd year CS student. Coffee addict." minRows={2} />
            <TextInput label="Email" defaultValue="maria@adormable.com" disabled />
            <Group justify="flex-end">
              <Button color="pink" radius="xl">
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Group>
      </Paper>

      <Tabs defaultValue="reservations">
        <Tabs.List>
          <Tabs.Tab value="reservations" leftSection={<IconCalendar size={16} />}>
            Active Reservations
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
            Activity History
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconUser size={16} />}>
            Account
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="reservations" pt="md">
          <Stack>
            {reservations.map((res, i) => (
              <Paper key={i} withBorder p="md" radius="md">
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
                    <ActionIcon variant="light" color="pink" size="sm">
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="red" size="sm">
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Action</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {activityHistory.map((item, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{item.action}</Table.Td>
                  <Table.Td>
                    <Badge color={typeColors[item.type]} variant="light" size="sm">
                      {item.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {item.date}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="md">
          <Paper shadow="md" p="lg" radius="md" className={classes.contentCard}>
            <Stack>
              <Title order={4} c="red">
                Danger Zone
              </Title>
              <Text size="sm" c="dimmed">
                Permanently delete your account and all associated data. This action cannot be undone.
              </Text>
              <Button color="red" variant="outline" w="fit-content" radius="xl">
                Delete Account
              </Button>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
