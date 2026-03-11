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
  Tooltip,
} from "@mantine/core";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SectionHeader } from "../../components/section-header.tsx";
import { UserAvatar } from "../../components/user-avatar.tsx";
import { TIME_SLOTS } from "../../features/study-nook/study-nook.constants.ts";
import { useAuth } from "../../lib/auth-context.tsx";
import { IconTrash, IconPlus } from "../../lib/icons.tsx";
import {
  getAllReservations,
  purgeExpiredReservations,
  cancelReservation,
  createWalkInReservation,
} from "../../server/reservations.ts";
import { getZone, getZones } from "../../server/zones.ts";

const FEEDBACK_TIMEOUT_MS = 2000;
type ZoneAvailability = Awaited<ReturnType<typeof getZone>>;

/** Convert "8:00 AM" → "08:00" (24-hour format for Date parsing). */
function to24h(time12: string): string {
  const [timePart, modifier] = time12.split(" ");
  const [rawH, rawM] = timePart.split(":").map(Number);
  let h = rawH;
  if (modifier === "PM" && h !== 12) {
    h += 12;
  }
  if (modifier === "AM" && h === 12) {
    h = 0;
  }
  return `${String(h).padStart(2, "0")}:${String(rawM).padStart(2, "0")}`;
}

export const Route = createFileRoute("/_app/concierge")({
  loader: async () => {
    const [reservations, zones] = await Promise.all([getAllReservations(), getZones()]);
    return { reservations, zones };
  },
  head: () => ({ meta: [{ title: "Concierge | Adormable" }] }),
  component: ConciergeDashboardPage,
});

function ConciergeDashboardPage() {
  const { reservations, zones } = Route.useLoaderData();
  const { image, name } = useAuth();
  const router = useRouter();
  const zoneNames = zones.map((z) => z.name);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [availableZoneData, setAvailableZoneData] = useState<ZoneAvailability | null>(null);

  useEffect(() => {
    if (selectedZone == null || startTime == null || endTime == null) {
      return;
    }

    const zone = zones.find((entry) => entry.name === selectedZone);
    if (!zone) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    let isCancelled = false;

    void (async () => {
      const zoneData = await getZone({
        data: {
          zoneId: zone.id,
          date: `${today}T00:00:00.000Z`,
          startTime: new Date(`${today}T${to24h(startTime)}:00`).toISOString(),
          endTime: new Date(`${today}T${to24h(endTime)}:00`).toISOString(),
        },
      });

      if (isCancelled) {
        return;
      }

      const options = zoneData.seats.map((seat) => ({
        value: seat.id,
        label: `${seat.label}${seat.taken ? " - unavailable" : ""}`,
        disabled: seat.taken,
      }));
      setAvailableZoneData(zoneData);
      setSelectedSeat((currentSeat) =>
        options.some((seat) => seat.value === currentSeat && !seat.disabled) ? currentSeat : null,
      );
    })();

    return () => {
      isCancelled = true;
    };
  }, [endTime, selectedZone, startTime, zones]);

  const seatOptions =
    availableZoneData?.seats.map((seat) => ({
      value: seat.id,
      label: `${seat.label}${seat.taken ? " - unavailable" : ""}`,
      disabled: seat.taken,
    })) ?? [];

  let seatHelpText = "Checking available seats for the selected walk-in slot...";
  if (selectedZone == null || startTime == null || endTime == null) {
    seatHelpText = "Select a zone and times to load open seats.";
  } else if (availableZoneData != null) {
    seatHelpText = `${availableZoneData.available} of ${availableZoneData.capacity} seats are open right now.`;
  }

  return (
    <Container size="lg" py="xl" className="pageEnter">
      <Group gap="md" mb="xs">
        <UserAvatar name={name} image={image} alt="Concierge" size={48} radius="xl" />
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
              onChange={(value) => {
                setSelectedZone(value);
                setSelectedSeat(null);
                setAvailableZoneData(null);
              }}
            />
            <Select
              label="Start Time"
              placeholder="Select"
              data={[...TIME_SLOTS]}
              value={startTime}
              onChange={(value) => {
                setStartTime(value);
                setSelectedSeat(null);
                setAvailableZoneData(null);
              }}
            />
            <Select
              label="End Time"
              placeholder="Select"
              data={[...TIME_SLOTS]}
              value={endTime}
              onChange={(value) => {
                setEndTime(value);
                setSelectedSeat(null);
                setAvailableZoneData(null);
              }}
            />
          </Group>
          <Select
            label="Seat"
            placeholder="Select an available seat"
            data={seatOptions}
            value={selectedSeat}
            disabled={seatOptions.length === 0}
            onChange={setSelectedSeat}
            description={seatHelpText}
          />
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
                if (
                  !studentName.trim() ||
                  !studentId.trim() ||
                  selectedZone == null ||
                  selectedSeat == null ||
                  startTime == null ||
                  endTime == null
                ) {
                  return;
                }
                const zone = zones.find((z) => z.name === selectedZone);
                if (!zone) {
                  return;
                }
                const today = new Date().toISOString().slice(0, 10);
                await createWalkInReservation({
                  data: {
                    studentName,
                    studentId,
                    zoneId: zone.id,
                    seatId: selectedSeat,
                    date: `${today}T00:00:00.000Z`,
                    startTime: new Date(`${today}T${to24h(startTime)}:00`).toISOString(),
                    endTime: new Date(`${today}T${to24h(endTime)}:00`).toISOString(),
                  },
                });
                setStudentName("");
                setStudentId("");
                setSelectedZone(null);
                setSelectedSeat(null);
                setStartTime(null);
                setEndTime(null);
                setBookingCreated(true);
                setTimeout(() => {
                  setBookingCreated(false);
                }, FEEDBACK_TIMEOUT_MS);
                void router.invalidate();
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
                  <Tooltip label="Cancel booking">
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      aria-label="Cancel booking"
                      onClick={async () => {
                        await cancelReservation({ data: { reservationId: booking.id } });
                        void router.invalidate();
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
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
                void router.invalidate();
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
