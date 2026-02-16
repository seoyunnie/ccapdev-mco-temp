import { Container, Title, Text, Paper, Group, Table, Badge, Select, TextInput, Tabs } from "@mantine/core";
import { IconSearch, IconUser, IconBug } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

const activityLogs = [
  {
    id: "l1",
    user: "Maria Santos",
    action: "Created reservation for Quiet Room A",
    type: "Reservation",
    timestamp: "2026-02-09 14:32:10",
  },
  {
    id: "l2",
    user: "Juan Reyes",
    action: "Posted 'Wi-Fi Issues on Floor 3' in Virtual Lobby",
    type: "Forum",
    timestamp: "2026-02-09 13:15:44",
  },
  {
    id: "l3",
    user: "Lab Tech Mike",
    action: "Purged 3 no-show bookings",
    type: "Admin",
    timestamp: "2026-02-09 12:00:00",
  },
  {
    id: "l4",
    user: "Ava Cruz",
    action: "Submitted review for Samgyup Corner (4★)",
    type: "Review",
    timestamp: "2026-02-09 11:45:22",
  },
  {
    id: "l5",
    user: "System",
    action: "User SpamBot42 banned for 7 days",
    type: "Admin",
    timestamp: "2026-02-08 23:10:05",
  },
];

const errorLogs = [
  {
    id: "e1",
    level: "Error",
    message: "Database connection timeout on query /api/reservations",
    timestamp: "2026-02-09 14:30:00",
  },
  { id: "e2", level: "Warning", message: "High memory usage detected (89%)", timestamp: "2026-02-09 12:15:00" },
  { id: "e3", level: "Info", message: "Scheduled backup completed successfully", timestamp: "2026-02-09 06:00:00" },
  {
    id: "e4",
    level: "Error",
    message: "Failed to send email notification to maria@adormable.com",
    timestamp: "2026-02-08 22:45:00",
  },
];

const typeColors: Record<string, string> = { Reservation: "pink", Forum: "grape", Admin: "red", Review: "teal" };

const levelColors: Record<string, string> = { Error: "red", Warning: "yellow", Info: "pink" };

export const Route = createFileRoute("/_app/admin/logs")({ component: SystemLogsPage });

function SystemLogsPage() {
  return (
    <Container size="lg" py="xl">
      <Title className="page-title" mb="xs">
        System Logs
      </Title>
      <Text c="dimmed" className="page-description" mb="xl">
        Audit trails and technical error monitoring.
      </Text>

      <Tabs defaultValue="activity">
        <Tabs.List>
          <Tabs.Tab value="activity" leftSection={<IconUser size={16} />}>
            User Activity
          </Tabs.Tab>
          <Tabs.Tab value="errors" leftSection={<IconBug size={16} />}>
            Error Logs
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="activity" pt="md">
          <Paper shadow="md" radius="md" className="content-card">
            <Group p="md" justify="space-between">
              <TextInput placeholder="Search logs..." leftSection={<IconSearch size={16} />} size="sm" />
              <Select
                placeholder="Filter by type"
                data={["All", "Reservation", "Forum", "Admin", "Review"]}
                defaultValue="All"
                size="sm"
              />
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Timestamp</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Type</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {activityLogs.map((log) => (
                  <Table.Tr key={log.id}>
                    <Table.Td>
                      <Text size="sm" c="dimmed" ff="monospace">
                        {log.timestamp}
                      </Text>
                    </Table.Td>
                    <Table.Td fw={500}>{log.user}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{log.action}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={typeColors[log.type]} variant="light" size="sm">
                        {log.type}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="errors" pt="md">
          <Paper shadow="md" radius="md" className="content-card">
            <Group p="md" justify="space-between">
              <TextInput placeholder="Search errors..." leftSection={<IconSearch size={16} />} size="sm" />
              <Select
                placeholder="Filter by level"
                data={["All", "Error", "Warning", "Info"]}
                defaultValue="All"
                size="sm"
              />
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Timestamp</Table.Th>
                  <Table.Th>Level</Table.Th>
                  <Table.Th>Message</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {errorLogs.map((log) => (
                  <Table.Tr key={log.id}>
                    <Table.Td>
                      <Text size="sm" c="dimmed" ff="monospace">
                        {log.timestamp}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={levelColors[log.level]} variant="light" size="sm">
                        {log.level}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{log.message}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
