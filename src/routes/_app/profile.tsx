import {
  Container,
  Title,
  Text,
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
  Modal,
  FileInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUser,
  IconCalendar,
  IconHistory,
  IconEdit,
  IconTrash,
  IconCamera,
  IconPhoto,
} from "@tabler/icons-react";
import { createFileRoute, useRouter, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { SectionHeader } from "../../components/section-header.tsx";
import { getUserProfile, updateProfile, deleteAccount } from "../../server/profile.ts";
import { cancelReservation } from "../../server/reservations.ts";

const typeColors: Record<string, string> = { Reservation: "pink", Forum: "grape", Review: "teal" };

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile | Adormable" }] }),
  loader: () => getUserProfile(),
  component: UserProfilePage,
});

function UserProfilePage() {
  const profile = Route.useLoaderData();
  const router = useRouter();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);

  const [photoOpened, { open: openPhoto, close: closePhoto }] = useDisclosure(false);
  const [deleteResOpened, { open: openDeleteRes, close: closeDeleteRes }] = useDisclosure(false);
  const [deleteResId, setDeleteResId] = useState<string | null>(null);

  return (
    <Container size="md" py="xl">
      <SectionHeader title="My Profile" description="Manage your account, reservations, and activity." />

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="xl">
        <Group wrap="wrap">
          <Stack align="center">
            <Avatar size={100} radius="xl" color="pink">
              {profile.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </Avatar>
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
                  router.invalidate();
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
          />
          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={closePhoto}>
              Cancel
            </Button>
            <Button color="pink" onClick={closePhoto}>
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
              if (deleteResId) {
                await cancelReservation({ data: { reservationId: deleteResId } });
                router.invalidate();
              }
              closeDeleteRes();
            }}
          >
            Cancel Reservation
          </Button>
        </Group>
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
                      onClick={() => {
                        void navigate({ to: "/study-nook" });
                      }}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
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
                <Table.Th>Type</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {profile.activityHistory.map((item, i) => (
                <Table.Tr key={i}>
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
                  if (!confirm("Are you sure? This will permanently delete your account and all data.")) return;
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
