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
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import defaultConcierge from "../../assets/avatars/default-concierge.svg";
import { SectionHeader } from "../../components/section-header.tsx";
import { TIME_SLOTS } from "../../features/study-nook/study-nook.constants.ts";
import {
  getAllReservations,
  purgeExpiredReservations,
  cancelReservation,
  createWalkInReservation,
} from "../../server/reservations.ts";
import { getZones } from "../../server/zones.ts";

const FEEDBACK_TIMEOUT_MS = 2000;

export const Route = createFileRoute("/_app/concierge")({
  head: () => ({ meta: [{ title: "Concierge | Adormable" }] }),
  loader: async () => {
    const [reservations, zones] = await Promise.all([getAllReservations(), getZones()]);
    return { reservations, zones };
  },
  component: ConciergeDashboardPage,
});

function ConciergeDashboardPage() {
  const { reservations, zones } = Route.useLoaderData();
  const router = useRouter();
  const zoneNames = zones.map((z) => z.name);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [bookingCreated, setBookingCreated] = useState(false);

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
              data={zoneNames}
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
            <Button
              color="pink"
              radius="xl"
              onClick={async () => {
                if (!studentName.trim() || !studentId.trim() || !selectedZone || !startTime || !endTime) return;
                const zone = zones.find((z) => z.name === selectedZone);
                if (!zone) return;
                const today = new Date().toISOString().slice(0, 10);
                await createWalkInReservation({
                  data: {
                    studentName,
                    studentId,
                    zoneId: zone.id,
                    startTime: new Date(`${today} ${startTime}`).toISOString(),
                    endTime: new Date(`${today} ${endTime}`).toISOString(),
                  },
                });
                setStudentName("");
                setStudentId("");
                setSelectedZone(null);
                setStartTime(null);
                setEndTime(null);
                setBookingCreated(true);
                setTimeout(() => {
                  setBookingCreated(false);
                }, FEEDBACK_TIMEOUT_MS);
                router.invalidate();
              }}
            >
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
            {reservations.map((booking) => (
              <Table.Tr key={booking.id}>
                <Table.Td>{booking.student}</Table.Td>
                <Table.Td>{booking.zone}</Table.Td>
                <Table.Td>{booking.time}</Table.Td>
                <Table.Td>
                  <Badge color={booking.status === "Cancelled" ? "red" : "yellow"} variant="light" size="sm">
                    {booking.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={async () => {
                      await cancelReservation({ data: { reservationId: booking.id } });
                      router.invalidate();
                    }}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {reservations.length > 0 && (
          <Group justify="flex-end" mt="md">
            <Button
              color="red"
              variant="light"
              radius="xl"
              onClick={async () => {
                await purgeExpiredReservations();
                router.invalidate();
              }}
            >
              Purge All Expired
            </Button>
          </Group>
        )}
      </Paper>
    </Container>
  );
}
