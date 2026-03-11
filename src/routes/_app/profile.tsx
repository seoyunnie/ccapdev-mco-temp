import {
  Container,
  Title,
  Text,
  Tabs,
  Paper,
  Group,
  Stack,
  TextInput,
  Textarea,
  Button,
  Badge,
  Table,
  ActionIcon,
  Modal,
  FileInput,
  Select,
  Switch,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { SectionHeader } from "../../components/section-header.tsx";
import { UserAvatar } from "../../components/user-avatar.tsx";
import { TIME_SLOTS } from "../../features/study-nook/study-nook.constants.ts";
import { IconUser, IconCalendar, IconHistory, IconEdit, IconTrash, IconCamera, IconPhoto } from "../../lib/icons.tsx";
import { getUserProfile, updateProfile, deleteAccount, uploadProfilePhoto } from "../../server/profile.ts";
import { cancelReservation, updateReservation } from "../../server/reservations.ts";

const typeColors: Record<string, string> = { Reservation: "pink", Forum: "grape", Review: "teal" };

export const Route = createFileRoute("/_app/profile")({
  loader: () => getUserProfile(),
  head: () => ({ meta: [{ title: "Profile | Adormable" }] }),
  component: UserProfilePage,
});

function UserProfilePage() {
  const profile = Route.useLoaderData();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);

  const [photoOpened, { open: openPhoto, close: closePhoto }] = useDisclosure(false);
  const [deleteResOpened, { open: openDeleteRes, close: closeDeleteRes }] = useDisclosure(false);
  const [editResOpened, { open: openEditRes, close: closeEditRes }] = useDisclosure(false);
  const [deleteResId, setDeleteResId] = useState<string | null>(null);
  const [editReservationId, setEditReservationId] = useState<string | null>(null);
  const [editReservationDate, setEditReservationDate] = useState("");
  const [editReservationStart, setEditReservationStart] = useState<string | null>(null);
  const [editReservationEnd, setEditReservationEnd] = useState<string | null>(null);
  const [editReservationAnonymous, setEditReservationAnonymous] = useState(false);
  const [editReservationSeat, setEditReservationSeat] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const openReservationEditor = (reservation: (typeof profile.reservations)[number]) => {
    setEditReservationId(reservation.id);
    setEditReservationDate(reservation.dateValue);
    setEditReservationStart(to12hSlot(reservation.startTimeValue));
    setEditReservationEnd(to12hSlot(reservation.endTimeValue));
    setEditReservationAnonymous(reservation.isAnonymous);
    setEditReservationSeat(reservation.seatLabel ?? "Unassigned");
    openEditRes();
  };

  return (
    <Container size="md" py="xl" className="pageEnter">
      <SectionHeader title="My Profile" description="Manage your account, reservations, and activity." />

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="xl">
        <Group wrap="wrap">
          <Stack align="center">
            <UserAvatar name={profile.name} image={profile.image} size={100} radius="xl" color="pink" />
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
            <TextInput label="Email" value={profile.email} disabled />
            <Group justify="flex-end">
              <Button
                color="pink"
                radius="xl"
                onClick={async () => {
                  await updateProfile({ data: { name: displayName, bio } });
                  void router.invalidate();
                }}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Group>
      </Paper>

      {/* Photo Upload Modal */}
      <Modal opened={photoOpened} onClose={closePhoto} title="Upload Profile Photo">
        <Stack>
          <FileInput
            placeholder="Choose an image"
            leftSection={<IconPhoto size={16} />}
            accept="image/*"
            value={photoFile}
            onChange={setPhotoFile}
          />
          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={closePhoto}>
              Cancel
            </Button>
            <Button
              color="pink"
              loading={photoUploading}
              disabled={!photoFile}
              onClick={async () => {
                if (!photoFile) {
                  return;
                }
                setPhotoUploading(true);
                try {
                  const reader = new FileReader();
                  // oxlint-disable-next-line promise/avoid-new
                  const dataUrl = await new Promise<string>((resolve, reject) => {
                    reader.addEventListener("load", () => {
                      const { result } = reader;
                      if (typeof result !== "string") {
                        reject(new Error("Unexpected FileReader result type"));
                        return;
                      }
                      resolve(result);
                    });
                    reader.addEventListener("error", () => reject(reader.error ?? new Error("FileReader error")));
                    reader.readAsDataURL(photoFile);
                  });
                  await uploadProfilePhoto({ data: { image: dataUrl } });
                  void router.invalidate();
                  closePhoto();
                  setPhotoFile(null);
                } finally {
                  setPhotoUploading(false);
                }
              }}
            >
              Upload
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Reservation Confirmation */}
      <Modal opened={deleteResOpened} onClose={closeDeleteRes} title="Cancel Reservation">
        <Text mb="lg">Are you sure you want to cancel this reservation?</Text>
        <Group justify="flex-end">
          <Button variant="light" color="gray" onClick={closeDeleteRes}>
            Keep
          </Button>
          <Button
            color="red"
            onClick={async () => {
              if (deleteResId != null) {
                await cancelReservation({ data: { reservationId: deleteResId } });
                void router.invalidate();
              }
              closeDeleteRes();
            }}
          >
            Cancel Reservation
          </Button>
        </Group>
      </Modal>

      <Modal opened={editResOpened} onClose={closeEditRes} title="Edit Reservation" centered>
        <Stack>
          <Text size="sm" c="dimmed">
            Seat stays assigned to {editReservationSeat}. This editor updates the reservation schedule and anonymity.
          </Text>
          <TextInput
            label="Reservation Date"
            type="date"
            value={editReservationDate}
            onChange={(e) => {
              setEditReservationDate(e.currentTarget.value);
            }}
          />
          <Group grow>
            <Select
              label="Start Time"
              data={[...TIME_SLOTS]}
              value={editReservationStart}
              onChange={setEditReservationStart}
            />
            <Select
              label="End Time"
              data={[...TIME_SLOTS]}
              value={editReservationEnd}
              onChange={setEditReservationEnd}
            />
          </Group>
          <Switch
            label="Anonymous Reservation"
            checked={editReservationAnonymous}
            onChange={(event) => {
              setEditReservationAnonymous(event.currentTarget.checked);
            }}
          />
          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={closeEditRes}>
              Cancel
            </Button>
            <Button
              color="pink"
              onClick={async () => {
                if (
                  editReservationId == null ||
                  !editReservationDate ||
                  editReservationStart == null ||
                  editReservationEnd == null
                ) {
                  return;
                }
                await updateReservation({
                  data: {
                    reservationId: editReservationId,
                    date: `${editReservationDate}T00:00:00.000Z`,
                    startTime: `${editReservationDate}T${to24h(editReservationStart)}:00.000Z`,
                    endTime: `${editReservationDate}T${to24h(editReservationEnd)}:00.000Z`,
                    isAnonymous: editReservationAnonymous,
                  },
                });
                closeEditRes();
                void router.invalidate();
              }}
            >
              Save Reservation
            </Button>
          </Group>
        </Stack>
      </Modal>

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
            {profile.reservations.map((res) => (
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
                      aria-label="Edit reservation"
                      onClick={() => {
                        openReservationEditor(res);
                      }}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      aria-label="Cancel reservation"
                      onClick={() => {
                        setDeleteResId(res.id);
                        openDeleteRes();
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
                <Table.Th>Category</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {profile.activityHistory.map((item) => (
                <Table.Tr key={item.id}>
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
              <Button
                color="red"
                variant="outline"
                w="fit-content"
                radius="xl"
                onClick={async () => {
                  if (!confirm("Are you sure? This will permanently delete your account and all data.")) {
                    return;
                  }
                  await deleteAccount();
                  void router.navigate({ to: "/login" });
                }}
              >
                Delete Account
              </Button>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

function to12hSlot(isoValue: string): string {
  return new Date(isoValue).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function to24h(time12: string): string {
  const [timePart, modifier] = time12.split(" ");
  const [rawHour, rawMinute] = timePart.split(":").map(Number);
  let hour = rawHour;
  if (modifier === "PM" && hour !== 12) {
    hour += 12;
  }
  if (modifier === "AM" && hour === 12) {
    hour = 0;
  }
  return `${String(hour).padStart(2, "0")}:${String(rawMinute).padStart(2, "0")}`;
}
