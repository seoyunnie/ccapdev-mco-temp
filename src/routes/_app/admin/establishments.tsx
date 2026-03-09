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
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import placeholder from "../../../assets/establishments/placeholder.svg";
import { SectionHeader } from "../../../components/section-header.tsx";

import imgStyles from "../../../components/shared-images.module.css";
import styles from "./admin.module.css";

const initialEstablishments = [
  { id: "1", name: "Café Manila", category: "Coffee Shop", owner: "cafe_manila_owner", status: "Active" },
  { id: "2", name: "Kuya's Carinderia", category: "Filipino Food", owner: "—", status: "Active" },
  { id: "3", name: "Quick Prints", category: "Services", owner: "quickprints_admin", status: "Active" },
  { id: "4", name: "Samgyup Corner", category: "Korean BBQ", owner: "—", status: "Inactive" },
];

const FEEDBACK_TIMEOUT_MS = 2000;

export const Route = createFileRoute("/_app/admin/establishments")({
  head: () => ({ meta: [{ title: "Establishments | Adormable" }] }),
  component: EstablishmentManagerPage,
});

function EstablishmentManagerPage() {
  const [search, setSearch] = useState("");
  const [establishments, setEstablishments] = useState(initialEstablishments);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [assignOpened, { open: openAssign, close: closeAssign }] = useDisclosure(false);
  const [selectedEst, setSelectedEst] = useState<(typeof initialEstablishments)[0] | null>(null);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newDesc, setNewDesc] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newOwner, setNewOwner] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const filteredEstablishments = establishments.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = () => {
    if (selectedEst) {
      setEstablishments((prev) => prev.filter((e) => e.id !== selectedEst.id));
      setSelectedEst(null);
      closeDelete();
    }
  };

  const handleSaveNew = () => {
    if (!newName || newCategory == null || newCategory === "") {
      return;
    }
    const newEst = {
      id: String(Date.now()),
      name: newName,
      category: newCategory,
      owner: newOwner ?? "—",
      status: "Active" as const,
    };
    setEstablishments((prev) => [...prev, newEst]);
    setNewName("");
    setNewCategory(null);
    setNewDesc("");
    setNewAddress("");
    setNewOwner(null);
    setSuccessMsg("Establishment added!");
    setTimeout(() => {
      setSuccessMsg("");
    }, FEEDBACK_TIMEOUT_MS);
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
            document.querySelector("#add-establishment-section")?.scrollIntoView({ behavior: "smooth" });
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
                        setSelectedEst(est);
                        openAssign();
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
                      onClick={() => {
                        setSelectedEst(est);
                        openEdit();
                      }}
                      aria-label="Edit establishment"
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      size="sm"
                      color="red"
                      onClick={() => {
                        setSelectedEst(est);
                        openDelete();
                      }}
                      aria-label="Delete establishment"
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

      {/* Edit Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit Establishment">
        {selectedEst && (
          <Stack>
            <TextInput label="Name" defaultValue={selectedEst.name} />
            <Select
              label="Category"
              defaultValue={selectedEst.category}
              data={["Coffee Shop", "Filipino Food", "Korean BBQ", "Services", "Convenience Store"]}
            />
            <Group justify="flex-end">
              <Button variant="light" color="gray" onClick={closeEdit}>
                Cancel
              </Button>
              <Button color="pink" onClick={closeEdit}>
                Save
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

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

      {/* Assign Owner Modal */}
      <Modal opened={assignOpened} onClose={closeAssign} title="Assign Owner">
        {selectedEst && (
          <Stack>
            <Text size="sm">
              Assign an owner account to <strong>{selectedEst.name}</strong>.
            </Text>
            <Select
              label="Owner Account"
              placeholder="Search users..."
              data={["cafe_manila_owner", "quickprints_admin", "maria@adormable.com", "mike@adormable.com"]}
              searchable
              clearable
            />
            <Group justify="flex-end">
              <Button variant="light" color="gray" onClick={closeAssign}>
                Cancel
              </Button>
              <Button color="pink" onClick={closeAssign}>
                Assign
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Paper shadow="md" p="lg" radius="md" className="content-card" mt="xl" id="add-establishment-section">
        <Title order={4} mb="md">
          Add New Establishment
        </Title>
        <img src={placeholder} alt="Preview" className={imgStyles.previewImage} />
        <Stack>
          <Group grow>
            <TextInput
              label="Name"
              placeholder="Establishment name"
              value={newName}
              onChange={(e) => {
                setNewName(e.currentTarget.value);
              }}
            />
            <Select
              label="Category"
              placeholder="Select category"
              data={["Coffee Shop", "Filipino Food", "Korean BBQ", "Services", "Convenience Store"]}
              value={newCategory}
              onChange={setNewCategory}
            />
          </Group>
          <TextInput
            label="Description"
            placeholder="Brief description"
            value={newDesc}
            onChange={(e) => {
              setNewDesc(e.currentTarget.value);
            }}
          />
          <Group grow>
            <TextInput
              label="Address"
              placeholder="Street address"
              value={newAddress}
              onChange={(e) => {
                setNewAddress(e.currentTarget.value);
              }}
            />
            <Select
              label="Assign Owner"
              placeholder="Search users..."
              data={["cafe_manila_owner", "quickprints_admin"]}
              searchable
              clearable
              value={newOwner}
              onChange={setNewOwner}
            />
          </Group>
          <Group justify="flex-end">
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setNewName("");
                setNewCategory(null);
                setNewDesc("");
                setNewAddress("");
                setNewOwner(null);
              }}
            >
              Cancel
            </Button>
            <Button color="pink" radius="xl" onClick={handleSaveNew}>
              Save Establishment
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
