import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Table,
  Button,
  TextInput,
  Select,
  Badge,
  ActionIcon,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconTrash, IconPlus, IconSearch } from "@tabler/icons-react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";

import placeholder from "../../../assets/establishments/placeholder.svg";
import { SectionHeader } from "../../../components/section-header.tsx";
import imgStyles from "../../../components/shared-images.module.css";
import {
  getEstablishments,
  createEstablishment,
  deleteEstablishment,
  updateEstablishment,
} from "../../../server/establishments.ts";
import { getUsers } from "../../../server/admin.ts";

import styles from "./index.module.css";

const FEEDBACK_TIMEOUT_MS = 2000;

export const Route = createFileRoute("/_app/admin/establishments")({
  head: () => ({ meta: [{ title: "Establishments | Adormable" }] }),
  loader: async () => {
    const [establishments, users] = await Promise.all([getEstablishments(), getUsers()]);
    return { establishments, users };
  },
  component: EstablishmentManagerPage,
});

function EstablishmentManagerPage() {
  const { establishments, users } = Route.useLoaderData();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [selectedEst, setSelectedEst] = useState<(typeof establishments)[0] | null>(null);

  const filteredEstablishments = establishments.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()),
  );

  const resetForm = () => {
    setEditId(null);
    setName("");
    setCategory(null);
    setDescription("");
    setAddress("");
    setOwnerId(null);
  };

  const handleDelete = async () => {
    if (selectedEst) {
      await deleteEstablishment({ data: { establishmentId: selectedEst.id } });
      setSelectedEst(null);
      closeDelete();
      router.invalidate();
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xs">
        <SectionHeader
          title="Establishment Manager"
          description="Manage directory entries and assign owner accounts."
          mb="xs"
        />
        <Button
          leftSection={<IconPlus size={16} />}
          color="pink"
          radius="xl"
          onClick={() => {
            resetForm();
            formRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Add Establishment
        </Button>
      </Group>

      <TextInput
        placeholder="Search establishments..."
        leftSection={<IconSearch size={16} />}
        mb="lg"
        value={search}
        onChange={(e) => {
          setSearch(e.currentTarget.value);
        }}
      />

      <Paper shadow="md" radius="md" className="content-card">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Owner Account</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredEstablishments.map((est) => (
              <Table.Tr key={est.id} className={styles.tableRow}>
                <Table.Td fw={500}>{est.name}</Table.Td>
                <Table.Td>
                  <Badge variant="light" size="sm">
                    {est.category}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {est.owner === "—" ? (
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => {
                        setEditId(est.id);
                        setName(est.name);
                        setCategory(est.category);
                        setDescription(est.description);
                        setOwnerId(null);
                        formRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Assign Owner
                    </Button>
                  ) : (
                    <Text size="sm">{est.owner}</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge color={est.status === "Active" ? "green" : "gray"} variant="light" size="sm">
                    {est.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <ActionIcon
                      variant="light"
                      size="sm"
                      color="pink"
                      aria-label="Edit establishment"
                      onClick={() => {
                        setEditId(est.id);
                        setName(est.name);
                        setCategory(est.category);
                        setDescription(est.description);
                        setOwnerId(null);
                        formRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      size="sm"
                      color="red"
                      aria-label="Delete establishment"
                      onClick={() => {
                        setSelectedEst(est);
                        openDelete();
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Establishment">
        <Text mb="lg">
          Are you sure you want to delete <strong>{selectedEst?.name}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" color="gray" onClick={closeDelete}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>

      <Paper shadow="md" p="lg" radius="md" className="content-card" mt="xl" ref={formRef}>
        <Title order={4} mb="md">
          {editId ? "Edit Establishment" : "Add New Establishment"}
        </Title>
        <img src={placeholder} alt="Preview" className={imgStyles.previewImage} />
        <Stack>
          <Group grow>
            <TextInput
              label="Name"
              placeholder="Establishment name"
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
            />
            <Select
              label="Category"
              placeholder="Select category"
              data={["Coffee Shop", "Filipino Food", "Korean BBQ", "Services", "Convenience Store"]}
              value={category}
              onChange={setCategory}
            />
          </Group>
          <TextInput
            label="Description"
            placeholder="Brief description"
            value={description}
            onChange={(e) => {
              setDescription(e.currentTarget.value);
            }}
          />
          <Group grow>
            <TextInput
              label="Address"
              placeholder="Street address"
              value={address}
              onChange={(e) => {
                setAddress(e.currentTarget.value);
              }}
            />
            <Select
              label="Assign Owner"
              placeholder="Search users..."
              data={users.map((u) => ({ value: u.id, label: u.name }))}
              searchable
              clearable
              value={ownerId}
              onChange={setOwnerId}
            />
          </Group>
          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              color="pink"
              radius="xl"
              onClick={async () => {
                if (editId) {
                  await updateEstablishment({
                    data: {
                      establishmentId: editId,
                      name: name || undefined,
                      category: category || undefined,
                      description: description || undefined,
                      ownerId: ownerId || undefined,
                    },
                  });
                } else {
                  if (!name || !category || !ownerId) return;
                  await createEstablishment({ data: { name, category, description, ownerId } });
                }
                resetForm();
                setSuccessMsg(editId ? "Establishment updated!" : "Establishment added!");
                setTimeout(() => {
                  setSuccessMsg("");
                }, FEEDBACK_TIMEOUT_MS);
                router.invalidate();
              }}
            >
              {editId ? "Save Changes" : "Save Establishment"}
            </Button>
          </Group>
          {successMsg && (
            <Text c="green" size="sm" ta="center">
              {successMsg}
            </Text>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
