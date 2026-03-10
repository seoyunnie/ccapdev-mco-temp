import {
  Container,
  Title,
  Text,
  Grid,
  Paper,
  Group,
  Stack,
  Button,
  Select,
  Switch,
  SimpleGrid,
  ActionIcon,
  Badge,
  Tooltip,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { BackButton } from "../../../components/back-button.tsx";
import { TIME_SLOTS, WEEK_DAYS } from "../../../features/study-nook/study-nook.constants.ts";
import { createReservation } from "../../../server/reservations.ts";
import { getZone } from "../../../server/zones.ts";

import styles from "./$zoneId.module.css";

export const Route = createFileRoute("/_app/study-nook/$zoneId")({
  loader: ({ params }) => getZone({ data: { zoneId: params.zoneId } }),
  head: () => ({ meta: [{ title: "Reserve a Seat | Adormable" }] }),
  component: ReservationPage,
});

function ReservationPage() {
  const zone = Route.useLoaderData();
  const router = useRouter();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Group seats into rows by letter prefix
  const seatRows: { id: string; label: string; taken: boolean }[][] = [];
  let currentRow: (typeof seatRows)[0] = [];
  let currentLetter = "";
  for (const seat of zone.seats) {
    const letter = seat.label.charAt(0);
    if (letter !== currentLetter && currentRow.length > 0) {
      seatRows.push(currentRow);
      currentRow = [];
    }
    currentLetter = letter;
    currentRow.push(seat);
  }
  if (currentRow.length > 0) {
    seatRows.push(currentRow);
  }

  return (
    <Container size="lg" py="xl">
      <BackButton to="/study-nook" label="Back to Zones" />

      <Title className="page-title" mb="xs">
        {zone.name} - Reserve a Seat
      </Title>
      <Text c="dimmed" mb="xl">
        Click on a green seat to select it, then choose your time slot.
      </Text>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper shadow="md" p="md" radius="md" className="content-card">
            <Text fw={600} mb="sm" ta="center">
              Seat Map
            </Text>
            <Group justify="center" mb="md" gap="lg">
              <Group gap={6}>
                <div className={styles.legendDot} style={{ backgroundColor: "var(--mantine-color-green-5)" }} />
                <Text size="xs">Available</Text>
              </Group>
              <Group gap={6}>
                <div className={styles.legendDot} style={{ backgroundColor: "var(--mantine-color-gray-5)" }} />
                <Text size="xs">Taken</Text>
              </Group>
              <Group gap={6}>
                <div className={styles.legendDot} style={{ backgroundColor: "var(--mantine-color-pink-5)" }} />
                <Text size="xs">Selected</Text>
              </Group>
            </Group>
            <Stack gap="xs" align="center">
              {seatRows.map((row) => (
                <Group key={row[0].label.charAt(0)} gap="xs">
                  <Text size="xs" w={20} fw={600}>
                    {row[0].label.charAt(0)}
                  </Text>
                  {row.map((seat) => {
                    const isSelected = selectedSeat === seat.id;
                    // oxlint-disable-next-line no-nested-ternary
                    const status = isSelected ? "Selected" : seat.taken ? "Taken" : "Available";
                    return (
                      <Tooltip key={seat.id} label={`Seat ${seat.label} — ${status}`}>
                        <ActionIcon
                          size="md"
                          variant="filled"
                          // oxlint-disable-next-line unicorn/no-nested-ternary, no-nested-ternary
                          color={isSelected ? "pink" : seat.taken ? "gray" : "green"}
                          onClick={() => {
                            if (!seat.taken) {
                              setSelectedSeat(seat.id);
                              setConfirmed(false);
                            }
                          }}
                          disabled={seat.taken}
                          aria-label={`Seat ${seat.label} — ${status}`}
                          className={styles.seatButton}
                        >
                          <Text size="xs" fw={600}>
                            {seat.label.slice(1)}
                          </Text>
                        </ActionIcon>
                      </Tooltip>
                    );
                  })}
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper shadow="md" p="md" radius="md" className="content-card">
            <Stack>
              <Text fw={600}>Booking Options</Text>
              <SimpleGrid cols={7} spacing="xs">
                {WEEK_DAYS.map((day, idx) => (
                  <Button
                    key={day}
                    size="xs"
                    variant={selectedDay === idx ? "filled" : "light"}
                    onClick={() => {
                      setSelectedDay(idx);
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </SimpleGrid>
              <Select
                label="Start Time"
                placeholder="Select time"
                data={[...TIME_SLOTS]}
                value={selectedStartTime}
                onChange={setSelectedStartTime}
              />
              <Select
                label="End Time"
                placeholder="Select time"
                data={[...TIME_SLOTS]}
                value={selectedEndTime}
                onChange={setSelectedEndTime}
              />
              <Switch
                label="Anonymous Reservation"
                description="Your name won't be visible to others"
                checked={anonymous}
                onChange={(e) => {
                  setAnonymous(e.currentTarget.checked);
                }}
              />
              {selectedSeat != null && (
                <Paper bg="pink.0" p="sm" radius="md">
                  <Text size="sm">
                    Selected seat: <Badge>{zone.seats.find((s) => s.id === selectedSeat)?.label ?? selectedSeat}</Badge>
                    {selectedStartTime != null && selectedEndTime != null && (
                      <>
                        {" "}
                        · {WEEK_DAYS[selectedDay]} · {selectedStartTime} – {selectedEndTime}
                      </>
                    )}
                  </Text>
                </Paper>
              )}
              {confirmed && (
                <Paper bg="green.0" p="sm" radius="md">
                  <Group gap="xs">
                    <IconCheck size={16} color="var(--mantine-color-green-6)" />
                    <Text size="sm" c="green.7" fw={600}>
                      Reservation confirmed for seat{" "}
                      {zone.seats.find((s) => s.id === selectedSeat)?.label ?? selectedSeat}!
                    </Text>
                  </Group>
                </Paper>
              )}
              <Button
                fullWidth
                disabled={selectedSeat == null || selectedStartTime == null || selectedEndTime == null}
                color="pink"
                radius="xl"
                onClick={async () => {
                  if (selectedSeat == null || selectedStartTime == null || selectedEndTime == null) {
                    return;
                  }
                  const baseDate = new Date();
                  baseDate.setDate(baseDate.getDate() + ((selectedDay - baseDate.getDay() + 7) % 7 || 7));
                  const dateStr = baseDate.toISOString().slice(0, 10);
                  await createReservation({
                    data: {
                      zoneId: zone.id,
                      seatId: selectedSeat,
                      date: `${dateStr}T00:00:00.000Z`,
                      startTime: `${dateStr}T${to24h(selectedStartTime)}:00.000Z`,
                      endTime: `${dateStr}T${to24h(selectedEndTime)}:00.000Z`,
                      isAnonymous: anonymous,
                    },
                  });
                  setConfirmed(true);
                  void router.invalidate();
                }}
              >
                Confirm Reservation
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

function to24h(time: string): string {
  const [rawTime, period] = time.split(" ");
  const [h, m] = rawTime.split(":").map(Number);
  let hour = h;
  if (period === "PM" && h !== 12) {
    hour += 12;
  }
  if (period === "AM" && h === 12) {
    hour = 0;
  }
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
