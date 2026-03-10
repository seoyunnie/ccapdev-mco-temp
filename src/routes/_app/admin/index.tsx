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
  Modal,
  Button,
  Stack,
  NumberInput,
  Textarea,
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

import type { UserRole } from "../../../contexts/auth-context.tsx";

import defaultAdmin from "../../../assets/avatars/default-admin.svg";
import { SectionHeader } from "../../../components/section-header.tsx";
import { StatCard } from "../../../components/stat-card.tsx";
import { ROLE_COLORS } from "../../../features/admin/admin.constants.ts";
import { getAdminStats, getUsers, updateUserRole, getDiagnostics } from "../../../server/admin.ts";
import { createBan } from "../../../server/moderation.ts";

import styles from "./index.module.css";

const STAT_META = [
  { key: "users" as const, label: "Total Users", icon: IconUsers, color: "pink" },
  { key: "reservations" as const, label: "Active Reservations", icon: IconBook, color: "teal" },
  { key: "threads" as const, label: "Forum Posts", icon: IconMessageCircle, color: "grape" },
  { key: "reviews" as const, label: "Reviews", icon: IconStar, color: "yellow" },
];

export const Route = createFileRoute("/_app/admin/")({
  loader: async () => {
    const [stats, users, diagnostics] = await Promise.all([getAdminStats(), getUsers(), getDiagnostics()]);
    return { stats, users, diagnostics };
  },
  head: () => ({ meta: [{ title: "Admin | Adormable" }] }),
  component: AdminControlPanelPage,
});

function AdminControlPanelPage() {
  const { stats, users, diagnostics } = Route.useLoaderData();
  const router = useRouter();
  const [userSearch, setUserSearch] = useState("");
  const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState("Admin action");
  const [banDuration, setBanDuration] = useState<number>(7);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ??
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
                  {/* oxlint-disable-next-line no-unsafe-type-assertion -- role comes from DB, always valid */}
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
                        const ROLE_ORDER: Record<string, string> = {
                          resident: "concierge",
                          concierge: "admin",
                          admin: "resident",
                        };
                        const nextRole = ROLE_ORDER[user.role] ?? "resident";
                        await updateUserRole({ data: { userId: user.id, role: nextRole } });
                        void router.invalidate();
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
                          void router.invalidate();
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
                        onClick={() => {
                          setBanTarget({ id: user.id, name: user.name });
                          setBanReason("Admin action");
                          setBanDuration(7);
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

      {/* Ban Confirmation Modal */}
      <Modal
        opened={banTarget != null}
        onClose={() => {
          setBanTarget(null);
        }}
        title="Ban User"
        centered
      >
        <Stack>
          <Text size="sm">
            Ban <b>{banTarget?.name}</b>?
          </Text>
          <Textarea
            label="Reason"
            placeholder="Reason for ban"
            value={banReason}
            onChange={(e) => {
              setBanReason(e.currentTarget.value);
            }}
          />
          <NumberInput
            label="Duration (days)"
            min={1}
            value={banDuration}
            onChange={(v) => {
              setBanDuration(typeof v === "number" ? v : 7);
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setBanTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={async () => {
                if (banTarget == null) {
                  return;
                }
                await createBan({ data: { userId: banTarget.id, reason: banReason, durationDays: banDuration } });
                setBanTarget(null);
                void router.invalidate();
              }}
            >
              Confirm Ban
            </Button>
          </Group>
        </Stack>
      </Modal>

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
              {diagnostics.api}
            </Badge>
          </Paper>
          <Paper
            bg={diagnostics.database === "Connected" ? "green.0" : "red.0"}
            p="md"
            radius="md"
            className={styles.diagnosticCard}
          >
            <Text size="sm" fw={600}>
              Database
            </Text>
            <Badge color={diagnostics.database === "Connected" ? "green" : "red"} mt="xs">
              {diagnostics.database}
            </Badge>
          </Paper>
          <Paper bg="blue.0" p="md" radius="md" className={styles.diagnosticCard}>
            <Text size="sm" fw={600}>
              Total Records
            </Text>
            <Badge color="blue" mt="xs">
              {diagnostics.totalRecords.toLocaleString()} records
            </Badge>
          </Paper>
        </SimpleGrid>
      </Paper>
    </Container>
  );
}
