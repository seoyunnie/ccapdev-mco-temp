import {
  Container,
  Title,
  Tabs,
  Paper,
  Group,
  Stack,
  Avatar,
  TextInput,
  Textarea,
  Button,
  Badge,
  Table,
  ActionIcon,
  Text,
  Modal,
  FileInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUser, IconCalendar, IconHistory, IconEdit, IconTrash, IconCamera, IconPhoto } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import defaultAvatarFemale from "../../assets/avatars/default-avatar-female.svg";
import { SectionHeader } from "../../components/section-header.tsx";

const initialReservations = [
  { id: "r1", zone: "Quiet Room A", date: "Feb 10, 2026", time: "2:00 PM – 4:00 PM", status: "Confirmed" },
  { id: "r2", zone: "Main Hall – Seat 12", date: "Feb 12, 2026", time: "10:00 AM – 12:00 PM", status: "Pending" },
];

const activityHistory = [
  { action: "Booked Quiet Room A", date: "Feb 8, 2026", type: "Reservation" },
  { action: "Posted in Virtual Lobby", date: "Feb 7, 2026", type: "Forum" },
  { action: "Reviewed Café Manila (5★)", date: "Feb 5, 2026", type: "Review" },
  { action: "Upvoted 'Wi-Fi Issues'", date: "Feb 4, 2026", type: "Forum" },
];

const typeColors: Record<string, string> = { Reservation: "pink", Forum: "grape", Review: "teal" };

const FEEDBACK_TIMEOUT_MS = 2000;

export const Route = createFileRoute("/_app/profile")({ component: UserProfilePage });

function UserProfilePage() {
  const [displayName, setDisplayName] = useState("Maria Santos");
  const [bio, setBio] = useState("3rd year CS student. Coffee addict.");
  const [saved, setSaved] = useState(false);
  const [reservations, setReservations] = useState(initialReservations);
  const [photoOpened, { open: openPhoto, close: closePhoto }] = useDisclosure(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, FEEDBACK_TIMEOUT_MS);
  };

  const handleDeleteReservation = () => {
    if (deleteTarget !== null) {
      setReservations((prev) => prev.filter((r) => r.id !== deleteTarget));
      setDeleteTarget(null);
    }
  };

  return (
    <Container size="md" py="xl">
      <SectionHeader title="My Profile" />

      <Modal opened={photoOpened} onClose={closePhoto} title="Change Profile Photo" centered>
        <Stack>
          <FileInput
            label="Upload a new photo"
            placeholder="Choose file"
            leftSection={<IconPhoto size={16} />}
            accept="image/*"
          />
          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={closePhoto}>
              Cancel
            </Button>
            <Button color="pink" radius="xl" onClick={closePhoto}>
              Upload
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deleteTarget !== null}
        onClose={() => {
          setDeleteTarget(null);
        }}
        title="Delete Reservation"
        centered
      >
        <Text mb="md">Are you sure you want to cancel this reservation? This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button
            variant="light"
            color="gray"
            onClick={() => {
              setDeleteTarget(null);
            }}
          >
            Keep
          </Button>
          <Button color="red" radius="xl" onClick={handleDeleteReservation}>
            Delete
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={editTarget !== null}
        onClose={() => {
          setEditTarget(null);
        }}
        title="Edit Reservation"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Editing: {reservations.find((r) => r.id === editTarget)?.zone}
          </Text>
          <TextInput label="Date" defaultValue={reservations.find((r) => r.id === editTarget)?.date} />
          <TextInput label="Time" defaultValue={reservations.find((r) => r.id === editTarget)?.time} />
          <Group justify="flex-end">
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setEditTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="pink"
              radius="xl"
              onClick={() => {
                setEditTarget(null);
              }}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="xl">
        <Group wrap="wrap">
          <Stack align="center">
            <Avatar size={100} radius="xl" src={defaultAvatarFemale} alt="Maria Santos" />
            <Button variant="light" color="pink" size="xs" leftSection={<IconCamera size={14} />} onClick={openPhoto}>
              Change Photo
            </Button>
          </Stack>
          <Stack style={{ flex: 1 }} gap="sm">
            <TextInput
              label="Display Name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.currentTarget.value);
              }}
            />
            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => {
                setBio(e.currentTarget.value);
              }}
              minRows={2}
            />
            <TextInput label="Email" defaultValue="maria@adormable.com" disabled />
            <Group justify="flex-end">
              {saved && (
                <Text size="sm" c="green.6" fw={600}>
                  Changes saved!
                </Text>
              )}
              <Button color="pink" radius="xl" onClick={handleSave}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Group>
      </Paper>

      <Tabs defaultValue="reservations">
        <Tabs.List>
          <Tabs.Tab value="reservations" leftSection={<IconCalendar size={16} />}>
            Active Reservations
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
            Activity History
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconUser size={16} />}>
            Account
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="reservations" pt="md">
          <Stack>
            {reservations.map((res) => (
              <Paper key={res.id} withBorder p="md" radius="md">
                <Group justify="space-between" wrap="wrap">
                  <Stack gap={2}>
                    <Text fw={600}>{res.zone}</Text>
                    <Text size="sm" c="dimmed">
                      {res.date} · {res.time}
                    </Text>
                  </Stack>
                  <Group>
                    <Badge color={res.status === "Confirmed" ? "green" : "yellow"} variant="light">
                      {res.status}
                    </Badge>
                    <ActionIcon
                      variant="light"
                      color="pink"
                      size="sm"
                      onClick={() => {
                        setEditTarget(res.id);
                      }}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={() => {
                        setDeleteTarget(res.id);
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Action</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {activityHistory.map((item) => (
                <Table.Tr key={item.action}>
                  <Table.Td>{item.action}</Table.Td>
                  <Table.Td>
                    <Badge color={typeColors[item.type]} variant="light" size="sm">
                      {item.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {item.date}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="md">
          <Paper shadow="md" p="lg" radius="md" className="content-card">
            <Stack>
              <Title order={4} c="red">
                Danger Zone
              </Title>
              <Text size="sm" c="dimmed">
                Permanently delete your account and all associated data. This action cannot be undone.
              </Text>
              <Button color="red" variant="outline" w="fit-content" radius="xl">
                Delete Account
              </Button>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
