import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  TextInput,
  Select,
  Button,
  Table,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import classes from "../../styles/shared.module.css";

const expiredBookings = [
  { id: "b1", student: "Carlos Lim", zone: "Main Hall – Seat 5", time: "10:00 AM – 12:00 PM", status: "No-Show" },
  { id: "b2", student: "Anonymous", zone: "Quiet Room B – Seat 3", time: "1:00 PM – 2:30 PM", status: "Expired" },
  { id: "b3", student: "Ava Cruz", zone: "Group Study – Table 2", time: "3:00 PM – 5:00 PM", status: "No-Show" },
];

const zones = ["Main Hall", "Quiet Room A", "Quiet Room B", "Group Study Room", "Computer Lab"];

export const Route = createFileRoute("/_app/concierge")({ component: ConciergeDashboardPage });

function ConciergeDashboardPage() {
  return (
    <Container size="lg" py="xl">
      <Title className={classes.pageTitle} mb="xs">
        Concierge Dashboard
      </Title>
      <Text c="dimmed" className={classes.pageDescription} mb="xl">
        Manage walk-in bookings and handle no-show reservations.
      </Text>

      <Paper shadow="md" p="lg" radius="md" className={classes.card} mb="xl">
        <Title order={4} mb="md">
          <Group gap="xs">
            <IconPlus size={18} />
            Walk-in Booking
          </Group>
        </Title>
        <Stack>
          <Group grow>
            <TextInput label="Student Name" placeholder="Enter student name" />
            <TextInput label="Student ID" placeholder="e.g. 2021-12345" />
          </Group>
          <Group grow>
            <Select label="Zone" placeholder="Select zone" data={zones} />
            <Select
              label="Start Time"
              placeholder="Select"
              data={["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM"]}
            />
            <Select
              label="End Time"
              placeholder="Select"
              data={["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM"]}
            />
          </Group>
          <Group justify="flex-end">
            <Button color="pink" radius="xl">
              Create Booking
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="md" p="lg" radius="md" className={classes.card}>
        <Title order={4} mb="md">
          No-Show Manager
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          Purge expired or no-show bookings to free up capacity.
        </Text>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student</Table.Th>
              <Table.Th>Zone</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {expiredBookings.map((booking) => (
              <Table.Tr key={booking.id}>
                <Table.Td>{booking.student}</Table.Td>
                <Table.Td>{booking.zone}</Table.Td>
                <Table.Td>{booking.time}</Table.Td>
                <Table.Td>
                  <Badge color={booking.status === "No-Show" ? "red" : "yellow"} variant="light" size="sm">
                    {booking.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <ActionIcon variant="light" color="red" size="sm">
                    <IconTrash size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Group justify="flex-end" mt="md">
          <Button color="red" variant="light" radius="xl">
            Purge All Expired
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
