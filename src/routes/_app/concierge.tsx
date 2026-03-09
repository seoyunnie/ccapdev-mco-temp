import {
  Avatar,
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
import { useState } from "react";

import defaultConcierge from "../../assets/avatars/default-concierge.svg";
import { SectionHeader } from "../../components/section-header.tsx";
import { TIME_SLOTS } from "../../features/study-nook/study-nook.constants.ts";

const initialExpiredBookings = [
  { id: "b1", student: "Carlos Lim", zone: "Main Hall – Seat 5", time: "10:00 AM – 12:00 PM", status: "No-Show" },
  { id: "b2", student: "Anonymous", zone: "Quiet Room B – Seat 3", time: "1:00 PM – 2:30 PM", status: "Expired" },
  { id: "b3", student: "Ava Cruz", zone: "Group Study – Table 2", time: "3:00 PM – 5:00 PM", status: "No-Show" },
];

const zones = ["Main Hall", "Quiet Room A", "Quiet Room B", "Group Study Room", "Computer Lab"];

const FEEDBACK_TIMEOUT_MS = 2000;

export const Route = createFileRoute("/_app/concierge")({
  head: () => ({ meta: [{ title: "Concierge | Adormable" }] }),
  component: ConciergeDashboardPage,
});

function ConciergeDashboardPage() {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [expiredBookings, setExpiredBookings] = useState(initialExpiredBookings);

  const handleCreateBooking = () => {
    if (!studentName.trim() || !studentId.trim() || selectedZone === null || startTime === null || endTime === null) {
      return;
    }
    setBookingCreated(true);
    setStudentName("");
    setStudentId("");
    setSelectedZone(null);
    setStartTime(null);
    setEndTime(null);
    setTimeout(() => {
      setBookingCreated(false);
    }, FEEDBACK_TIMEOUT_MS);
  };

  const handlePurge = (id: string) => {
    setExpiredBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const handlePurgeAll = () => {
    setExpiredBookings([]);
  };

  return (
    <Container size="lg" py="xl">
      <Group gap="md" mb="xs">
        <Avatar src={defaultConcierge} alt="Concierge" size={48} radius="xl" />
        <SectionHeader
          title="Concierge Dashboard"
          description="Manage walk-in bookings and handle no-show reservations."
          mb="xs"
        />
      </Group>

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="xl">
        <Title order={4} mb="md">
          <Group gap="xs">
            <IconPlus size={18} />
            Walk-in Booking
          </Group>
        </Title>
        <Stack>
          <Group grow>
            <TextInput
              label="Student Name"
              placeholder="Enter student name"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.currentTarget.value);
              }}
            />
            <TextInput
              label="Student ID"
              placeholder="e.g. 2021-12345"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.currentTarget.value);
              }}
            />
          </Group>
          <Group grow>
            <Select
              label="Zone"
              placeholder="Select zone"
              data={zones}
              value={selectedZone}
              onChange={setSelectedZone}
            />
            <Select
              label="Start Time"
              placeholder="Select"
              data={[...TIME_SLOTS]}
              value={startTime}
              onChange={setStartTime}
            />
            <Select
              label="End Time"
              placeholder="Select"
              data={[...TIME_SLOTS]}
              value={endTime}
              onChange={setEndTime}
            />
          </Group>
          <Group justify="flex-end" gap="sm">
            {bookingCreated && (
              <Text size="sm" c="green.6" fw={600}>
                Booking created!
              </Text>
            )}
            <Button color="pink" radius="xl" onClick={handleCreateBooking}>
              Create Booking
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="md" p="lg" radius="md" className="content-card">
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
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => {
                      handlePurge(booking.id);
                    }}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {expiredBookings.length > 0 && (
          <Group justify="flex-end" mt="md">
            <Button color="red" variant="light" radius="xl" onClick={handlePurgeAll}>
              Purge All Expired
            </Button>
          </Group>
        )}
      </Paper>
    </Container>
  );
}
