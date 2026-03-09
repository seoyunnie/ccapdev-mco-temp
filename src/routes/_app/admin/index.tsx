import {
  Avatar,
  Container,
  Text,
  Paper,
  Group,
  SimpleGrid,
  Table,
  Badge,
  TextInput,
  ActionIcon,
  Title,
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
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import defaultAdmin from "../../../assets/avatars/default-admin.svg";
import { SectionHeader } from "../../../components/section-header.tsx";
import { StatCard } from "../../../components/stat-card.tsx";
import type { UserRole } from "../../../contexts/auth-context.tsx";
import { ROLE_COLORS } from "../../../features/admin/admin.constants.ts";
import { getAdminStats, getUsers, updateUserRole } from "../../../server/admin.ts";
import { createBan } from "../../../server/moderation.ts";

import styles from "./index.module.css";

const STAT_META = [
  { key: "users" as const, label: "Total Users", icon: IconUsers, color: "pink" },
  { key: "reservations" as const, label: "Active Reservations", icon: IconBook, color: "teal" },
  { key: "threads" as const, label: "Forum Posts", icon: IconMessageCircle, color: "grape" },
  { key: "reviews" as const, label: "Reviews", icon: IconStar, color: "yellow" },
];

export const Route = createFileRoute("/_app/admin/")({
  head: () => ({ meta: [{ title: "Admin | Adormable" }] }),
  loader: async () => {
    const [stats, users] = await Promise.all([getAdminStats(), getUsers()]);
    return { stats, users };
  },
  component: AdminControlPanelPage,
});

function AdminControlPanelPage() {
  const { stats, users } = Route.useLoaderData();
  const router = useRouter();
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <Container size="lg" py="xl">
      <Group gap="md" mb="xs">
        <Avatar src={defaultAdmin} alt="Admin" size={48} radius="xl" />
        <SectionHeader title="Admin Control Panel" description="System overview and user management." mb="xs" />
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} mb="xl">
        {STAT_META.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={String(stats[stat.key])}
            color={stat.color}
            iconComponent={stat.icon}
          />
        ))}
      </SimpleGrid>

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={4}>User Management</Title>
          <TextInput
            placeholder="Search users..."
            leftSection={<IconSearch size={16} />}
            size="sm"
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.currentTarget.value);
            }}
          />
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
            {filteredUsers.map((user) => (
              <Table.Tr key={user.id} className={styles.tableRow}>
                <Table.Td fw={500}>{user.name}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {user.email}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={ROLE_COLORS[user.role as UserRole]} variant="light" size="sm">
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
                    <ActionIcon
                      variant="light"
                      size="sm"
                      color="pink"
                      aria-label="Cycle role"
                      onClick={async () => {
                        const nextRole =
                          user.role === "resident"
                            ? "concierge"
                            : user.role === "concierge"
                              ? "admin"
                              : "resident";
                        await updateUserRole({ data: { userId: user.id, role: nextRole } });
                        router.invalidate();
                      }}
                    >
                      <IconRefresh size={14} />
                    </ActionIcon>
                    {user.status === "Banned" ? (
                      <ActionIcon
                        variant="light"
                        size="sm"
                        color="green"
                        aria-label="Restore user"
                        onClick={async () => {
                          // Restore by cycling role (no unban endpoint yet)
                          await updateUserRole({ data: { userId: user.id, role: user.role } });
                          router.invalidate();
                        }}
                      >
                        <IconRefresh size={14} />
                      </ActionIcon>
                    ) : (
                      <ActionIcon
                        variant="light"
                        size="sm"
                        color="red"
                        aria-label="Ban user"
                        onClick={async () => {
                          await createBan({ data: { userId: user.id, reason: "Admin action", durationDays: 7 } });
                          router.invalidate();
                        }}
                      >
                        <IconBan size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper shadow="md" p="lg" radius="md" className="content-card">
        <Title order={4} mb="md">
          Site Diagnostics
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Paper bg="green.0" p="md" radius="md" className={styles.diagnosticCard}>
            <Text size="sm" fw={600}>
              API Status
            </Text>
            <Badge color="green" mt="xs">
              Operational
            </Badge>
          </Paper>
          <Paper bg="green.0" p="md" radius="md" className={styles.diagnosticCard}>
            <Text size="sm" fw={600}>
              Database
            </Text>
            <Badge color="green" mt="xs">
              Connected
            </Badge>
          </Paper>
          <Paper bg="yellow.0" p="md" radius="md" className={styles.diagnosticCard}>
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
