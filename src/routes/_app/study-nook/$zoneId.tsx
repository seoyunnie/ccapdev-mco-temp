import { useState } from "react";
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
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import classes from "../../../styles/shared.module.css";

const seatMap = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) => ({
    id: `${String.fromCharCode(65 + row)}${col + 1}`,
    taken: Math.random() > 0.6,
  })),
);

const timeSlots = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Route = createFileRoute("/_app/study-nook/$zoneId")({ component: ReservationPage });

function ReservationPage() {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [anonymous, setAnonymous] = useState(false);

  return (
    <Container size="lg" py="xl">
      <Group mb="md">
        <Link to="/study-nook">
          <Button variant="subtle" color="pink" size="sm">
            ← Back to Zones
          </Button>
        </Link>
      </Group>

      <Title className={classes.pageTitle} mb="xs">
        Main Hall - Reserve a Seat
      </Title>
      <Text c="dimmed" mb="xl">
        Click on a green seat to select it, then choose your time slot.
      </Text>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper shadow="md" p="md" radius="md" className={classes.card}>
            <Text fw={600} mb="sm" ta="center">
              Seat Map
            </Text>
            <Group justify="center" mb="md" gap="lg">
              <Group gap={6}>
                <div
                  style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "var(--mantine-color-green-5)" }}
                />
                <Text size="xs">Available</Text>
              </Group>
              <Group gap={6}>
                <div
                  style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "var(--mantine-color-red-5)" }}
                />
                <Text size="xs">Taken</Text>
              </Group>
              <Group gap={6}>
                <div
                  style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "var(--mantine-color-pink-5)" }}
                />
                <Text size="xs">Selected</Text>
              </Group>
            </Group>
            <Stack gap="xs" align="center">
              {seatMap.map((row, ri) => (
                <Group key={ri} gap="xs">
                  <Text size="xs" w={20} fw={600}>
                    {String.fromCharCode(65 + ri)}
                  </Text>
                  {row.map((seat) => {
                    const isSelected = selectedSeat === seat.id;
                    return (
                      <Tooltip key={seat.id} label={seat.id}>
                        <ActionIcon
                          size="md"
                          variant="filled"
                          color={isSelected ? "pink" : seat.taken ? "red" : "green"}
                          onClick={() => !seat.taken && setSelectedSeat(seat.id)}
                          disabled={seat.taken}
                          style={{ cursor: seat.taken ? "not-allowed" : "pointer" }}
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
          <Paper shadow="md" p="md" radius="md" className={classes.card}>
            <Stack>
              <Text fw={600}>Booking Options</Text>
              <Group justify="space-between">
                <ActionIcon variant="light" onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}>
                  <IconChevronLeft size={16} />
                </ActionIcon>
                <SimpleGrid cols={7} spacing="xs">
                  {weekDays.map((d, i) => (
                    <Button
                      key={d}
                      size="xs"
                      variant={selectedDay === i ? "filled" : "light"}
                      onClick={() => setSelectedDay(i)}
                    >
                      {d}
                    </Button>
                  ))}
                </SimpleGrid>
                <ActionIcon variant="light" onClick={() => setSelectedDay(Math.min(6, selectedDay + 1))}>
                  <IconChevronRight size={16} />
                </ActionIcon>
              </Group>
              <Select label="Start Time" placeholder="Select time" data={timeSlots} />
              <Select label="End Time" placeholder="Select time" data={timeSlots} />
              <Switch
                label="Anonymous Reservation"
                description="Your name won't be visible to others"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.currentTarget.checked)}
              />
              {selectedSeat && (
                <Paper bg="pink.0" p="sm" radius="md">
                  <Text size="sm">
                    Selected seat: <Badge>{selectedSeat}</Badge>
                  </Text>
                </Paper>
              )}
              <Button fullWidth disabled={!selectedSeat} color="pink" radius="xl">
                Confirm Reservation
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
