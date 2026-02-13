import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Group,
  Stack,
  Table,
  Badge,
  TextInput,
  RingProgress,
  ActionIcon,
} from "@mantine/core";
import {
  IconUsers,
  IconBook,
  IconMessageCircle,
  IconStar,
  IconSearch,
  IconBan,
  IconRefresh,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import classes from "../../../styles/shared.module.css";

const stats = [
  { label: "Total Users", value: "1,247", icon: IconUsers, color: "pink" },
  { label: "Active Reservations", value: "89", icon: IconBook, color: "teal" },
  { label: "Forum Posts", value: "3,421", icon: IconMessageCircle, color: "grape" },
  { label: "Reviews", value: "612", icon: IconStar, color: "yellow" },
];

const users = [
  { id: "u1", name: "Maria Santos", email: "maria@adormable.com", role: "Resident", status: "Active" },
  { id: "u2", name: "Juan Reyes", email: "juan@adormable.com", role: "Resident", status: "Active" },
  { id: "u3", name: "SpamBot42", email: "spam@fake.com", role: "Resident", status: "Banned" },
  { id: "u4", name: "Lab Tech Mike", email: "mike@adormable.com", role: "Concierge", status: "Active" },
];

const roleColors: Record<string, string> = { Resident: "pink", Concierge: "teal", Admin: "red" };

export const Route = createFileRoute("/_app/admin/")({ component: AdminControlPanelPage });

function AdminControlPanelPage() {
  return (
    <Container size="lg" py="xl">
      <Title className={classes.pageTitle} mb="xs">
        Admin Control Panel
      </Title>
      <Text c="dimmed" className={classes.pageDescription} mb="xl">
        System overview and user management.
      </Text>

      <SimpleGrid cols={{ base: 2, md: 4 }} mb="xl">
        {stats.map((stat) => (
          <Paper key={stat.label} shadow="md" p="md" radius="md" className={classes.contentCard}>
            <Group justify="space-between">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {stat.label}
                </Text>
                <Text size="xl" fw={700}>
                  {stat.value}
                </Text>
              </Stack>
              <RingProgress
                size={60}
                thickness={5}
                sections={[{ value: 65, color: stat.color }]}
                label={<stat.icon size={20} style={{ display: "block", margin: "auto" }} />}
              />
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper shadow="md" p="lg" radius="md" className={classes.contentCard} mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={4}>User Management</Title>
          <TextInput placeholder="Search users..." leftSection={<IconSearch size={16} />} size="sm" />
        </Group>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td fw={500}>{user.name}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {user.email}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={roleColors[user.role]} variant="light" size="sm">
                    {user.role}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={user.status === "Active" ? "green" : "red"} variant="light" size="sm">
                    {user.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <ActionIcon variant="light" size="sm" color="pink">
                      <IconRefresh size={14} />
                    </ActionIcon>
                    <ActionIcon variant="light" size="sm" color="red">
                      <IconBan size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper shadow="md" p="lg" radius="md" className={classes.contentCard}>
        <Title order={4} mb="md">
          Site Diagnostics
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Paper bg="green.0" p="md" radius="md">
            <Text size="sm" fw={600}>
              API Status
            </Text>
            <Badge color="green" mt="xs">
              Operational
            </Badge>
          </Paper>
          <Paper bg="green.0" p="md" radius="md">
            <Text size="sm" fw={600}>
              Database
            </Text>
            <Badge color="green" mt="xs">
              Connected
            </Badge>
          </Paper>
          <Paper bg="yellow.0" p="md" radius="md">
            <Text size="sm" fw={600}>
              Storage
            </Text>
            <Badge color="yellow" mt="xs">
              72% Used
            </Badge>
          </Paper>
        </SimpleGrid>
      </Paper>
    </Container>
  );
}
