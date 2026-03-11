import {
  Container,
  Text,
  Paper,
  Group,
  SimpleGrid,
  Table,
  Badge,
  TextInput,
  Title,
  Modal,
  Button,
  Stack,
  NumberInput,
  Textarea,
} from "@mantine/core";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { RowActionMenu } from "../../../components/row-action-menu.tsx";
import { SectionHeader } from "../../../components/section-header.tsx";
import { StatCard } from "../../../components/stat-card.tsx";
import { UserAvatar } from "../../../components/user-avatar.tsx";
import { ROLE_COLORS } from "../../../features/admin/admin.constants.ts";
import { type UserRole, useAuth } from "../../../lib/auth-context.tsx";
import {
  IconUsers,
  IconBook,
  IconMessageCircle,
  IconStar,
  IconSearch,
  IconBan,
  IconRefresh,
  IconMessageCircleExclamation,
} from "../../../lib/icons.tsx";
import { getAdminStats, getUsers, updateUserRole, getDiagnostics, unbanUser } from "../../../server/admin.ts";
import { createBan, getBanAppeals, reviewBanAppeal } from "../../../server/moderation.ts";

import styles from "./index.module.css";

const STAT_META = [
  { key: "users" as const, label: "Total Users", icon: IconUsers, color: "pink" },
  { key: "reservations" as const, label: "Active Reservations", icon: IconBook, color: "teal" },
  { key: "threads" as const, label: "Forum Posts", icon: IconMessageCircle, color: "grape" },
  { key: "reviews" as const, label: "Reviews", icon: IconStar, color: "yellow" },
];

function getAppealStatusColor(status: string) {
  if (status === "pending") {
    return "orange";
  }

  if (status === "approved") {
    return "green";
  }

  return "red";
}

export const Route = createFileRoute("/_app/admin/")({
  loader: async () => {
    const [stats, users, diagnostics, appeals] = await Promise.all([
      getAdminStats(),
      getUsers(),
      getDiagnostics(),
      getBanAppeals(),
    ]);
    return { stats, users, diagnostics, appeals };
  },
  head: () => ({ meta: [{ title: "Admin | Adormable" }] }),
  component: AdminControlPanelPage,
});

function AdminControlPanelPage() {
  const { stats, users, diagnostics, appeals } = Route.useLoaderData();
  const { image, name } = useAuth();
  const router = useRouter();
  const [userSearch, setUserSearch] = useState("");
  const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState("Admin action");
  const [banDuration, setBanDuration] = useState<number>(7);
  const [appealTarget, setAppealTarget] = useState<(typeof appeals)[number] | null>(null);
  const [staffNote, setStaffNote] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <Container size="lg" py="xl" className="pageEnter">
      <Group gap="md" mb="xs">
        <UserAvatar name={name} image={image} alt="Admin" size={48} radius="xl" />
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
                  {user.pendingAppeals > 0 && (
                    <Badge color="orange" variant="light" size="sm" ml={6}>
                      {user.pendingAppeals} appeal{user.pendingAppeals > 1 ? "s" : ""}
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <RowActionMenu
                    items={[
                      {
                        label: "Cycle role",
                        leftSection: <IconRefresh size={14} />,
                        onClick: async () => {
                          const ROLE_ORDER: Record<string, string> = {
                            resident: "concierge",
                            concierge: "admin",
                            admin: "resident",
                          };
                          const nextRole = ROLE_ORDER[user.role] ?? "resident";
                          await updateUserRole({ data: { userId: user.id, role: nextRole } });
                          void router.invalidate();
                        },
                      },
                      ...(user.pendingAppeals > 0
                        ? [
                            {
                              label: "Open appeal queue",
                              leftSection: <IconMessageCircleExclamation size={14} />,
                              onClick: () => {
                                const pendingAppeal = appeals.find(
                                  (appeal) => appeal.userId === user.id && appeal.status === "pending",
                                );
                                if (pendingAppeal != null) {
                                  setAppealTarget(pendingAppeal);
                                  setStaffNote(pendingAppeal.staffNote ?? "");
                                }
                              },
                            },
                          ]
                        : []),
                      user.status === "Banned"
                        ? {
                            label: "Unban user",
                            color: "green",
                            leftSection: <IconRefresh size={14} />,
                            onClick: async () => {
                              await unbanUser({ data: { userId: user.id } });
                              void router.invalidate();
                            },
                          }
                        : {
                            label: "Ban user",
                            color: "red",
                            leftSection: <IconBan size={14} />,
                            onClick: () => {
                              setBanTarget({ id: user.id, name: user.name });
                              setBanReason("Admin action");
                              setBanDuration(7);
                            },
                          },
                    ]}
                  />
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

      <Modal
        opened={appealTarget != null}
        onClose={() => {
          setAppealTarget(null);
          setStaffNote("");
        }}
        title="Review Appeal"
        centered
      >
        {appealTarget != null && (
          <Stack>
            <Text size="sm">
              <b>{appealTarget.userName}</b> appealed the current ban.
            </Text>
            <Text size="sm" c="dimmed">
              Ban reason: {appealTarget.banReason}
            </Text>
            <Paper withBorder p="sm" radius="md">
              <Text size="sm">{appealTarget.message}</Text>
            </Paper>
            <Textarea
              label="Staff note"
              placeholder="Optional context for the final decision"
              value={staffNote}
              onChange={(event) => {
                setStaffNote(event.currentTarget.value);
              }}
            />
            <Group justify="space-between">
              <Button
                variant="light"
                color="red"
                onClick={async () => {
                  await reviewBanAppeal({ data: { appealId: appealTarget.id, decision: "reject", staffNote } });
                  setAppealTarget(null);
                  setStaffNote("");
                  void router.invalidate();
                }}
              >
                Reject Appeal
              </Button>
              <Button
                color="green"
                onClick={async () => {
                  await reviewBanAppeal({ data: { appealId: appealTarget.id, decision: "approve", staffNote } });
                  setAppealTarget(null);
                  setStaffNote("");
                  void router.invalidate();
                }}
              >
                Approve and Unban
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={4}>Appeals Queue</Title>
          <Badge color="orange" variant="light">
            {appeals.filter((appeal) => appeal.status === "pending").length} pending
          </Badge>
        </Group>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Resident</Table.Th>
              <Table.Th>Reason</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Submitted</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {appeals.map((appeal) => (
              <Table.Tr key={appeal.id}>
                <Table.Td>
                  <Text fw={500}>{appeal.userName}</Text>
                  <Text size="sm" c="dimmed">
                    {appeal.userEmail}
                  </Text>
                </Table.Td>
                <Table.Td>{appeal.banReason}</Table.Td>
                <Table.Td>
                  <Badge color={getAppealStatusColor(appeal.status)} variant="light">
                    {appeal.status}
                  </Badge>
                </Table.Td>
                <Table.Td>{new Date(appeal.createdAt).toLocaleDateString("en-US")}</Table.Td>
                <Table.Td>
                  {appeal.status === "pending" ? (
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setAppealTarget(appeal);
                        setStaffNote(appeal.staffNote ?? "");
                      }}
                    >
                      Review
                    </Button>
                  ) : (
                    <Text size="sm" c="dimmed">
                      {appeal.reviewerName ?? "Staff"}
                    </Text>
                  )}
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
