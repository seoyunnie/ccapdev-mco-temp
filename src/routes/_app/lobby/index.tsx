import {
  Container,
  Text,
  Card,
  Group,
  Stack,
  Avatar,
  Badge,
  Button,
  ActionIcon,
  Modal,
  Textarea,
  TextInput,
  Select,
  Chip,
  Tabs,
  Progress,
  Paper,
  Pagination,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconArrowUp, IconPlus, IconEye } from "@tabler/icons-react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import { EmptyState } from "../../../components/empty-state.tsx";
import { SearchBar } from "../../../components/search-bar.tsx";
import { SectionHeader } from "../../../components/section-header.tsx";
import { TAG_COLORS, DEFAULT_TAGS } from "../../../features/lobby/lobby.constants.ts";
import { createThread, getThreads } from "../../../server/threads.ts";

const MAX_CONTENT_LENGTH = 2000;

export const Route = createFileRoute("/_app/lobby/")({
  loader: () => getThreads({ data: {} }),
  head: () => ({ meta: [{ title: "Lobby | Adormable" }] }),
  component: ForumFeedPage,
});

function ForumFeedPage() {
  const result = Route.useLoaderData();
  const posts = result.items;
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string | null>("Newest");
  const [activeTag, setActiveTag] = useState<string>("All");

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [previewTab, setPreviewTab] = useState<string | null>("write");

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState<string | null>(null);

  const allTags = ["All", ...DEFAULT_TAGS.map((c) => c.name)];

  const filtered = posts
    .filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ?? p.snippet.toLowerCase().includes(search.toLowerCase());
      const matchTag = activeTag === "All" || p.tag === activeTag;
      return matchSearch && matchTag;
    })
    // oxlint-disable-next-line no-array-sort -- filter() already creates a new array
    .sort((a, b) => (sort === "Most Popular" ? b.upvotes - a.upvotes : 0));

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      return;
    }
    await createThread({ data: { title: newTitle, content: newContent, tag: newTag ?? undefined } });
    setNewTitle("");
    setNewContent("");
    setNewTag(null);
    closeCreate();
    notifications.show({ title: "Post created!", message: "Your post is now live.", color: "green" });
    void router.invalidate();
  };

  return (
    <Container size="md" py="xl">
      {/* Create Post Modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="Create New Post" centered size="lg">
        <Tabs value={previewTab} onChange={setPreviewTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="write">Write</Tabs.Tab>
            <Tabs.Tab value="preview" leftSection={<IconEye size={14} />}>
              Preview
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="write">
            <Stack>
              <TextInput
                label="Title"
                placeholder="Post title"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.currentTarget.value);
                }}
              />
              <Select
                label="Tag"
                placeholder="Select tag"
                data={DEFAULT_TAGS.map((c) => c.name)}
                value={newTag}
                onChange={setNewTag}
              />
              <Textarea
                label="Content"
                placeholder="Write your post..."
                minRows={4}
                maxLength={MAX_CONTENT_LENGTH}
                value={newContent}
                onChange={(e) => {
                  setNewContent(e.currentTarget.value);
                }}
              />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {newContent.length}/{MAX_CONTENT_LENGTH}
                </Text>
                <Progress
                  value={(newContent.length / MAX_CONTENT_LENGTH) * 100}
                  size="xs"
                  color={newContent.length > MAX_CONTENT_LENGTH * 0.9 ? "red" : "pink"}
                  w={100}
                />
              </Group>
              <Group justify="flex-end">
                <Button
                  color="pink"
                  radius="xl"
                  onClick={() => {
                    void handleCreate();
                  }}
                >
                  Create Post
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="preview">
            <Paper p="md" withBorder radius="md">
              <Text fw={700} size="lg" mb="xs">
                {newTitle || "Untitled"}
              </Text>
              {newTag != null && (
                <Badge color={TAG_COLORS[newTag] ?? "gray"} variant="light" mb="sm">
                  {newTag}
                </Badge>
              )}
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {newContent || "No content yet..."}
              </Text>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Modal>

      <Group justify="space-between" mb="xs">
        <SectionHeader
          title="The Virtual Lobby"
          description="Discuss, share, and connect with fellow dormitory residents."
          color="grape"
          mb="xs"
        />
        <Group>
          <Button leftSection={<IconPlus size={16} />} color="pink" radius="xl" onClick={openCreate}>
            New Post
          </Button>
        </Group>
      </Group>

      <SearchBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search posts..."
        filterData={["Newest", "Most Popular"]}
        filterValue={sort}
        onFilterChange={setSort}
        filterPlaceholder="Sort by"
      />

      <Chip.Group
        value={activeTag}
        onChange={(v) => {
          if (typeof v === "string") {
            setActiveTag(v);
          }
        }}
      >
        <Group gap="xs" mb="lg">
          {allTags.map((tag) => (
            <Chip
              key={tag}
              value={tag}
              variant="light"
              color={tag === "All" ? "gray" : (TAG_COLORS[tag] ?? "gray")}
              size="sm"
            >
              {tag}
            </Chip>
          ))}
        </Group>
      </Chip.Group>

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
                    <Badge color={TAG_COLORS[post.tag] ?? "gray"} size="sm" variant="light">
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

      {result.total > result.pageSize && (
        <Group justify="center" mt="xl">
          <Pagination total={Math.ceil(result.total / result.pageSize)} value={result.page} color="pink" />
        </Group>
      )}
    </Container>
  );
}
