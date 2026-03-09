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
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { BackButton } from "../../../components/back-button.tsx";
import { TIME_SLOTS, WEEK_DAYS } from "../../../features/study-nook/study-nook.constants.ts";

import styles from "./$zoneId.module.css";

export const Route = createFileRoute("/_app/study-nook/$zoneId")({ component: ReservationPage });

const zones: Record<string, string> = {
  "main-hall": "Main Hall",
  "quiet-room-a": "Quiet Room A",
  "quiet-room-b": "Quiet Room B",
  "group-study": "Group Study Room",
  "computer-lab": "Computer Lab",
  "reading-room": "Reading Room",
};

const CHAR_A = "A".codePointAt(0)!;
const TAKEN_SEATS = new Set(["A2", "A5", "A7", "B1", "B3", "B6", "C4", "C8", "D2", "D5", "D7", "E1", "E3", "E6"]);

const SEAT_MAP = Array.from({ length: 5 }, (_row, row) =>
  Array.from({ length: 8 }, (_seat, col) => {
    const id = `${String.fromCodePoint(CHAR_A + row)}${col + 1}`;
    return { id, taken: TAKEN_SEATS.has(id) };
  }),
);

function ReservationPage() {
  const { zoneId } = Route.useParams();
  const zoneName = zones[zoneId] ?? "Unknown Zone";

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Container size="lg" py="xl">
      <BackButton to="/study-nook" label="Back to Zones" />

      <Title className="page-title" mb="xs">
        {zoneName} - Reserve a Seat
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
              {SEAT_MAP.map((row) => (
                <Group key={row[0]?.id.charAt(0)} gap="xs">
                  <Text size="xs" w={20} fw={600}>
                    {row[0]?.id.charAt(0)}
                  </Text>
                  {row.map((seat) => {
                    const isSelected = selectedSeat === seat.id;
                    // oxlint-disable-next-line no-nested-ternary
                    const status = isSelected ? "Selected" : seat.taken ? "Taken" : "Available";
                    return (
                      <Tooltip key={seat.id} label={`Seat ${seat.id} — ${status}`}>
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
                          aria-label={`Seat ${seat.id} — ${status}`}
                          className={styles.seatButton}
                        >
                          <Text size="xs" fw={600}>
                            {seat.id.slice(1)}
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
                    Selected seat: <Badge>{selectedSeat}</Badge>
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
                      Reservation confirmed for seat {selectedSeat}!
                    </Text>
                  </Group>
                </Paper>
              )}
              <Button
                fullWidth
                disabled={selectedSeat == null}
                color="pink"
                radius="xl"
                onClick={() => {
                  setConfirmed(true);
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
