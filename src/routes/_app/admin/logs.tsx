import { Container, Text, Paper, Group, Table, Badge, Select, TextInput, Tabs, Pagination, Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SectionHeader } from "../../../components/section-header.tsx";
import { IconBug, IconSearch, IconUser } from "../../../lib/icons.tsx";
import { getActivityLogs, getErrorLogs } from "../../../server/admin.ts";

import styles from "./index.module.css";

const typeColors: Record<string, string> = { Reservation: "pink", Forum: "grape", Admin: "red", Review: "teal" };

const levelColors: Record<string, string> = { Error: "red", Warning: "yellow", Info: "blue" };

export const Route = createFileRoute("/_app/admin/logs")({
  loader: async () => {
    const [activityResult, errorResult] = await Promise.all([
      getActivityLogs({ data: { page: 1, pageSize: 50 } }),
      getErrorLogs({ data: { page: 1, pageSize: 50 } }),
    ]);
    return { activityResult, errorResult };
  },
  head: () => ({ meta: [{ title: "Logs | Adormable" }] }),
  component: SystemLogsPage,
});

function SystemLogsPage() {
  const { activityResult, errorResult } = Route.useLoaderData();
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<string | null>("All");
  const [errorSearch, setErrorSearch] = useState("");
  const [errorFilter, setErrorFilter] = useState<string | null>("All");
  const [activityPage, setActivityPage] = useState(1);
  const [errorPage, setErrorPage] = useState(1);

  const activityLogs = activityResult.items;
  const errorLogs = errorResult.items;

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
    <Container size="lg" py="xl" className="pageEnter">
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
                placeholder="Filter by category"
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
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Current Role</Table.Th>
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
                      <Text size="sm">{log.detail ?? log.action}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={typeColors[log.type]} variant="light" size="sm">
                        {log.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" tt="capitalize">
                        {log.actorRole}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {activityResult.total > activityResult.pageSize && (
              <Group justify="center" p="md">
                <Pagination
                  total={Math.ceil(activityResult.total / activityResult.pageSize)}
                  value={activityPage}
                  onChange={setActivityPage}
                  color="pink"
                />
              </Group>
            )}
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
            {filteredErrorLogs.length === 0 ? (
              <Stack align="center" p="xl">
                <Text c="dimmed" size="sm">
                  No error logs recorded.
                </Text>
              </Stack>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Timestamp</Table.Th>
                    <Table.Th>Level</Table.Th>
                    <Table.Th>Source</Table.Th>
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
                        <Text size="sm" c="dimmed">
                          {log.source}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{log.message}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
            {errorResult.total > errorResult.pageSize && (
              <Group justify="center" p="md">
                <Pagination
                  total={Math.ceil(errorResult.total / errorResult.pageSize)}
                  value={errorPage}
                  onChange={setErrorPage}
                  color="pink"
                />
              </Group>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
