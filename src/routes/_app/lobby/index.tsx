import {
  Container,
  Title,
  Text,
  TextInput,
  Select,
  Card,
  Group,
  Stack,
  Avatar,
  Badge,
  Button,
  ActionIcon,
} from "@mantine/core";
import { IconSearch, IconArrowUp, IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

const posts = [
  {
    id: "1",
    title: "Best study spots in the dorm?",
    author: "Maria Santos",
    snippet: "I've been looking for quiet places to study after 9 PM. Any suggestions from fellow residents?",
    upvotes: 24,
    comments: 8,
    tag: "Discussion",
    time: "2 hours ago",
  },
  {
    id: "2",
    title: "Wi-Fi Issues on Floor 3",
    author: "Juan Reyes",
    snippet: "Anyone else experiencing slow internet on the 3rd floor? It's been like this for a week now.",
    upvotes: 42,
    comments: 15,
    tag: "Issue",
    time: "5 hours ago",
  },
  {
    id: "3",
    title: "Movie night this Saturday!",
    author: "Ava Cruz",
    snippet: "We're organizing a movie night in the common area. Bring snacks! Vote for the movie below.",
    upvotes: 67,
    comments: 23,
    tag: "Event",
    time: "1 day ago",
  },
  {
    id: "4",
    title: "Lost AirPods in laundry room",
    author: "Carlos Lim",
    snippet:
      "Left my AirPods Pro in the 2nd floor laundry room yesterday. White case with a blue sticker. Please DM if found!",
    upvotes: 11,
    comments: 3,
    tag: "Lost & Found",
    time: "1 day ago",
  },
];

const tagColors: Record<string, string> = {
  Discussion: "pink",
  Issue: "red",
  Event: "grape",
  "Lost & Found": "yellow",
};

export const Route = createFileRoute("/_app/lobby/")({ component: ForumFeedPage });

function ForumFeedPage() {
  const [search, setSearch] = useState("");

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) || p.snippet.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xs">
        <Title className="page-title">The Virtual Lobby</Title>
        <Button leftSection={<IconPlus size={16} />} color="pink" radius="xl">
          New Post
        </Button>
      </Group>
      <Text c="dimmed" className="page-description" mb="xl">
        Discuss, share, and connect with fellow dormitory residents.
      </Text>

      <Group mb="lg" grow>
        <TextInput
          placeholder="Search posts..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
          }}
        />
        <Select placeholder="Sort by" data={["Newest", "Most Popular"]} defaultValue="Newest" />
      </Group>

      <Stack>
        {filtered.map((post) => (
          <Card
            key={post.id}
            shadow="md"
            padding="lg"
            radius="md"
            className="content-card"
            component={Link}
            to={`/lobby/${post.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Group justify="space-between" wrap="wrap">
              <Group>
                <Avatar color="pink" radius="xl">
                  {post.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>
                <Stack gap={2}>
                  <Group gap="xs">
                    <Text fw={600}>{post.title}</Text>
                    <Badge color={tagColors[post.tag]} size="sm" variant="light">
                      {post.tag}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {post.author} · {post.time}
                  </Text>
                </Stack>
              </Group>
              <Group gap="xs">
                <ActionIcon variant="light" color="pink" size="sm">
                  <IconArrowUp size={14} />
                </ActionIcon>
                <Text size="sm" fw={600}>
                  {post.upvotes}
                </Text>
                <Text size="xs" c="dimmed">
                  · {post.comments} replies
                </Text>
              </Group>
            </Group>
            <Text size="sm" c="dimmed" mt="sm" lineClamp={2}>
              {post.snippet}
            </Text>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
