import { Container, Text, Card, Group, Stack, Avatar, Badge, Button, ActionIcon } from "@mantine/core";
import { IconArrowUp, IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import threadPlaceholder from "../../../assets/lobby/thread-placeholder.svg";
import { EmptyState } from "../../../components/empty-state.tsx";
import { SearchBar } from "../../../components/search-bar.tsx";
import { SectionHeader } from "../../../components/section-header.tsx";
import { TAG_COLORS, TAG_ICONS } from "../../../features/lobby/lobby.constants.ts";

import imgStyles from "../../../components/shared-images.module.css";

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
] as const;

export const Route = createFileRoute("/_app/lobby/")({
  head: () => ({ meta: [{ title: "Lobby | Adormable" }] }),
  component: ForumFeedPage,
});

function ForumFeedPage() {
  const [search, setSearch] = useState("");

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) || p.snippet.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xs">
        <SectionHeader
          title="The Virtual Lobby"
          description="Discuss, share, and connect with fellow dormitory residents."
          color="grape"
          mb="xs"
        />
        <Button leftSection={<IconPlus size={16} />} color="grape" radius="xl">
          New Post
        </Button>
      </Group>

      <SearchBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search posts..."
        filterData={["Newest", "Most Popular"]}
        filterPlaceholder="Sort by"
        filterValue="Newest"
        onFilterChange={() => {}}
      />

      {filtered.length === 0 && <EmptyState image={emptyState} message="No posts match your search." />}

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
            <img src={threadPlaceholder} alt="" className={imgStyles.cardImageShort} />
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
                    <Badge
                      color={TAG_COLORS[post.tag]}
                      size="sm"
                      variant="light"
                      leftSection={
                        TAG_ICONS[post.tag] ? (
                          <img src={TAG_ICONS[post.tag]} alt="" width={12} height={12} />
                        ) : undefined
                      }
                    >
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
