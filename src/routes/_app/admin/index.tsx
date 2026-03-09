import {
  Avatar,
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Group,
  Table,
  Badge,
  TextInput,
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
import { useState } from "react";

import defaultAdmin from "../../../assets/avatars/default-admin.svg";
import { SectionHeader } from "../../../components/section-header.tsx";
import { StatCard } from "../../../components/stat-card.tsx";
import { UserRole } from "../../../contexts/auth-context.tsx";
import { ROLE_COLORS } from "../../../features/admin/admin.constants.ts";

import styles from "./admin.module.css";

const stats = [
  { label: "Total Users", value: "1,247", icon: IconUsers, color: "pink" },
  { label: "Active Reservations", value: "89", icon: IconBook, color: "teal" },
  { label: "Forum Posts", value: "3,421", icon: IconMessageCircle, color: "grape" },
  { label: "Reviews", value: "612", icon: IconStar, color: "yellow" },
];

const initialUsers = [
  { id: "u1", name: "Maria Santos", email: "maria@adormable.com", role: UserRole.RESIDENT, status: "Active" },
  { id: "u2", name: "Juan Reyes", email: "juan@adormable.com", role: UserRole.RESIDENT, status: "Active" },
  { id: "u3", name: "SpamBot42", email: "spam@fake.com", role: UserRole.RESIDENT, status: "Banned" },
  { id: "u4", name: "Lab Tech Mike", email: "mike@adormable.com", role: UserRole.CONCIERGE, status: "Active" },
];

export const Route = createFileRoute("/_app/admin/")({
  head: () => ({ meta: [{ title: "Admin | Adormable" }] }),
  component: AdminControlPanelPage,
});

function AdminControlPanelPage() {
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState(initialUsers);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const toggleBan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === "Active" ? "Banned" : "Active" } : u)),
    );
  };

  return (
    <Container size="lg" py="xl">
      <Group gap="md" mb="xs">
        <Avatar src={defaultAdmin} alt="Admin" size={48} radius="xl" />
        <SectionHeader title="Admin Control Panel" description="System overview and user management." mb="xs" />
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} mb="xl">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
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
                  <Badge color={ROLE_COLORS[user.role]} variant="light" size="sm">
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
                    {user.status === "Banned" ? (
                      <ActionIcon
                        variant="light"
                        size="sm"
                        color="green"
                        onClick={() => {
                          toggleBan(user.id);
                        }}
                        aria-label="Restore user"
                      >
                        <IconRefresh size={14} />
                      </ActionIcon>
                    ) : (
                      <ActionIcon
                        variant="light"
                        size="sm"
                        color="red"
                        onClick={() => {
                          toggleBan(user.id);
                        }}
                        aria-label="Ban user"
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
