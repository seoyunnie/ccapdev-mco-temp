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
import { createFileRoute } from "@tanstack/react-router";
import { AppLink } from "../../../components/app-link.tsx";
import classes from "../../../styles/shared.module.css";

const establishments = [
  { id: "1", name: "Café Manila", category: "Coffee Shop", owner: "cafe_manila_owner", status: "Active" },
  { id: "2", name: "Kuya's Carinderia", category: "Filipino Food", owner: "—", status: "Active" },
  { id: "3", name: "Quick Prints", category: "Services", owner: "quickprints_admin", status: "Active" },
  { id: "4", name: "Samgyup Corner", category: "Korean BBQ", owner: "—", status: "Inactive" },
];

export const Route = createFileRoute("/_app/admin/establishments")({ component: EstablishmentManagerPage });

function EstablishmentManagerPage() {
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xs">
        <Title className={classes.pageTitle}>Establishment Manager</Title>
        <Button leftSection={<IconPlus size={16} />} color="pink" radius="xl">
          Add Establishment
        </Button>
      </Group>
      <Text c="dimmed" className={classes.pageDescription} mb="xl">
        Manage directory entries and assign owner accounts.
      </Text>

      <TextInput placeholder="Search establishments..." leftSection={<IconSearch size={16} />} mb="lg" />

      <Paper shadow="md" radius="md" className={classes.contentCard}>
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
            {establishments.map((est) => (
              <Table.Tr key={est.id}>
                <Table.Td fw={500}>{est.name}</Table.Td>
                <Table.Td>
                  <Badge variant="light" size="sm">
                    {est.category}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {est.owner === "—" ? (
                    <Button size="xs" variant="subtle">
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
                    <ActionIcon variant="light" size="sm" color="pink">
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon variant="light" size="sm" color="red">
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Paper shadow="md" p="lg" radius="md" className={classes.contentCard} mt="xl">
        <Title order={4} mb="md">
          Add New Establishment
        </Title>
        <Stack>
          <Group grow>
            <TextInput label="Name" placeholder="Establishment name" />
            <Select
              label="Category"
              placeholder="Select category"
              data={["Coffee Shop", "Filipino Food", "Korean BBQ", "Services", "Convenience Store"]}
            />
          </Group>
          <TextInput label="Description" placeholder="Brief description" />
          <Group grow>
            <TextInput label="Address" placeholder="Street address" />
            <Select
              label="Assign Owner"
              placeholder="Search users..."
              data={["cafe_manila_owner", "quickprints_admin"]}
              searchable
              clearable
            />
          </Group>
          <Group justify="flex-end">
            <Button variant="light" color="gray">
              Cancel
            </Button>
            <Button color="pink" radius="xl">
              Save Establishment
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
