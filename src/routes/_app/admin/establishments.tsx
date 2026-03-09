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
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus, IconSearch } from "@tabler/icons-react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";

import {
  getEstablishments,
  createEstablishment,
  deleteEstablishment,
  updateEstablishment,
} from "../../../server/establishments.ts";
import { getUsers } from "../../../server/admin.ts";

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
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = establishments.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xs">
        <Title className="page-title">Establishment Manager</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          color="pink"
          radius="xl"
          onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          Add Establishment
        </Button>
      </Group>
      <Text c="dimmed" className="page-description" mb="xl">
        Manage directory entries and assign owner accounts.
      </Text>

      <TextInput
        placeholder="Search establishments..."
        leftSection={<IconSearch size={16} />}
        mb="lg"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
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
            {filtered.map((est) => (
              <Table.Tr key={est.id}>
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
                      onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
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
                      onClick={async () => {
                        if (!confirm(`Delete "${est.name}"?`)) return;
                        await deleteEstablishment({ data: { establishmentId: est.id } });
                        router.invalidate();
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

      <Paper shadow="md" p="lg" radius="md" className="content-card" mt="xl" ref={formRef}>
        <Title order={4} mb="md">
          {editId ? "Edit Establishment" : "Add New Establishment"}
        </Title>
        <Stack>
          <Group grow>
            <TextInput label="Name" placeholder="Establishment name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
            <Select
              label="Category"
              placeholder="Select category"
              data={["Coffee Shop", "Filipino Food", "Korean BBQ", "Services", "Convenience Store"]}
              value={category}
              onChange={setCategory}
            />
          </Group>
          <TextInput label="Description" placeholder="Brief description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} />
          <Group grow>
            <TextInput label="Address" placeholder="Street address" />
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
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setEditId(null);
                setName("");
                setCategory(null);
                setDescription("");
                setOwnerId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="pink"
              radius="xl"
              onClick={async () => {
                if (editId) {
                  await updateEstablishment({ data: { establishmentId: editId, name: name || undefined, category: category || undefined, description: description || undefined, ownerId: ownerId || undefined } });
                } else {
                  if (!name || !category || !ownerId) return;
                  await createEstablishment({ data: { name, category, description, ownerId } });
                }
                setEditId(null);
                setName("");
                setCategory(null);
                setDescription("");
                setOwnerId(null);
                router.invalidate();
              }}
            >
              {editId ? "Save Changes" : "Save Establishment"}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
