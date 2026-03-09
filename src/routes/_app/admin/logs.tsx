import { Container, Text, Paper, Group, Table, Badge, Select, TextInput, Tabs } from "@mantine/core";
import { IconSearch, IconUser, IconBug } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SectionHeader } from "../../../components/section-header.tsx";
import { getActivityLogs } from "../../../server/admin.ts";

import styles from "./index.module.css";

const typeColors: Record<string, string> = { Reservation: "pink", Forum: "grape", Admin: "red", Review: "teal" };

const levelColors: Record<string, string> = { Error: "red", Warning: "yellow", Info: "blue" };

const errorLogs = [
  { id: "e1", timestamp: "2026-02-08 14:32:01", level: "Error", message: "Database connection timeout on replica-2" },
  { id: "e2", timestamp: "2026-02-08 13:15:44", level: "Warning", message: "High memory usage detected (89%)" },
  { id: "e3", timestamp: "2026-02-07 22:01:12", level: "Info", message: "Scheduled backup completed successfully" },
  { id: "e4", timestamp: "2026-02-07 18:45:33", level: "Error", message: "Failed to send email notification to user" },
];

export const Route = createFileRoute("/_app/admin/logs")({
  loader: () => getActivityLogs(),
  head: () => ({ meta: [{ title: "Logs | Adormable" }] }),
  component: SystemLogsPage,
});

function SystemLogsPage() {
  const activityLogs = Route.useLoaderData();
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<string | null>("All");
  const [errorSearch, setErrorSearch] = useState("");
  const [errorFilter, setErrorFilter] = useState<string | null>("All");

  const filteredActivityLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.action.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesType =
      activityFilter == null || activityFilter === "" || activityFilter === "All" || log.type === activityFilter;
    return matchesSearch && matchesType;
  });

  const filteredErrorLogs = errorLogs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(errorSearch.toLowerCase());
    const matchesLevel =
      errorFilter == null || errorFilter === "" || errorFilter === "All" || log.level === errorFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <Container size="lg" py="xl">
      <SectionHeader title="System Logs" description="Audit trails and technical error monitoring." />

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
              <TextInput
                placeholder="Search logs..."
                leftSection={<IconSearch size={16} />}
                size="sm"
                value={activitySearch}
                onChange={(e) => {
                  setActivitySearch(e.currentTarget.value);
                }}
              />
              <Select
                placeholder="Filter by type"
                data={["All", "Reservation", "Forum", "Admin", "Review"]}
                value={activityFilter}
                onChange={setActivityFilter}
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
                {filteredActivityLogs.map((log) => (
                  <Table.Tr key={log.id} className={styles.tableRow}>
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
              <TextInput
                placeholder="Search errors..."
                leftSection={<IconSearch size={16} />}
                size="sm"
                value={errorSearch}
                onChange={(e) => {
                  setErrorSearch(e.currentTarget.value);
                }}
              />
              <Select
                placeholder="Filter by level"
                data={["All", "Error", "Warning", "Info"]}
                value={errorFilter}
                onChange={setErrorFilter}
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
                {filteredErrorLogs.map((log) => (
                  <Table.Tr key={log.id} className={styles.tableRow}>
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
