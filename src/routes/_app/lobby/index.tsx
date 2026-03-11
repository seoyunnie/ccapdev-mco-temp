import {
  Container,
  Text,
  Card,
  Group,
  Stack,
  Badge,
  Button,
  Modal,
  Textarea,
  TextInput,
  Select,
  Tabs,
  Progress,
  Paper,
  Pagination,
  ThemeIcon,
  FileInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import threadPlaceholder from "../../../assets/lobby/thread-placeholder.svg";
import { EmptyState } from "../../../components/empty-state.tsx";
import { PageSkeleton } from "../../../components/page-skeleton.tsx";
import { SearchBar } from "../../../components/search-bar.tsx";
import { SectionHeader } from "../../../components/section-header.tsx";
import { UserAvatar } from "../../../components/user-avatar.tsx";
import { TAG_COLORS, DEFAULT_TAGS } from "../../../features/lobby/lobby.constants.ts";
import { useAuth } from "../../../lib/auth-context.tsx";
import { IconArrowUp, IconEye, IconPhoto, IconPlus } from "../../../lib/icons.tsx";
import { createThread, getThreads } from "../../../server/threads.ts";

import imgStyles from "../../../components/shared-images.module.css";

const MAX_CONTENT_LENGTH = 2000;

function getVoteColor(vote: number) {
  if (vote === 1) {
    return "pink";
  }

  if (vote === -1) {
    return "red";
  }

  return "gray";
}

export const Route = createFileRoute("/_app/lobby/")({
  loader: () => getThreads({ data: {} }),
  head: () => ({ meta: [{ title: "Lobby | Adormable" }] }),
  pendingComponent: PageSkeleton,
  component: ForumFeedPage,
});

function ForumFeedPage() {
  const result = Route.useLoaderData();
  const posts = result.items;
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string | null>("Newest");
  const [activeTag, setActiveTag] = useState<string>("All");

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [previewTab, setPreviewTab] = useState<string | null>("write");

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);

  const allTags = ["All", ...DEFAULT_TAGS.map((c) => c.name)];

  const filtered = posts
    .filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) || p.snippet.toLowerCase().includes(search.toLowerCase());
      const matchTag = activeTag === "All" || p.tag === activeTag;
      return matchSearch && matchTag;
    })
    // oxlint-disable-next-line no-array-sort -- filter() already creates a new array
    .sort((a, b) => (sort === "Most Popular" ? b.upvotes - a.upvotes : 0));

  const handleCreate = async () => {
    if (!isLoggedIn) {
      void router.navigate({ to: "/login" });
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      return;
    }
    await createThread({
      data: { title: newTitle, content: newContent, tag: newTag ?? undefined, image: newImage ?? undefined },
    });
    setNewTitle("");
    setNewContent("");
    setNewTag(null);
    setNewImage(null);
    closeCreate();
    notifications.show({ title: "Post created!", message: "Your post is now live.", color: "green" });
    void router.invalidate();
  };

  return (
    <Container size="md" py="xl" className="pageEnter">
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
              <FileInput
                label="Thread image"
                placeholder="Upload an optional thread image"
                leftSection={<IconPhoto size={16} />}
                accept="image/*"
                onChange={(file) => {
                  if (file == null) {
                    setNewImage(null);
                    return;
                  }
                  const reader = new FileReader();
                  reader.addEventListener("load", () => {
                    if (typeof reader.result === "string") {
                      setNewImage(reader.result);
                    }
                  });
                  reader.readAsDataURL(file);
                }}
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
              <img src={newImage ?? threadPlaceholder} alt="Thread preview" className={imgStyles.cardImage} />
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
          <Button
            leftSection={<IconPlus size={16} />}
            color="pink"
            radius="xl"
            onClick={() => {
              if (!isLoggedIn) {
                void router.navigate({ to: "/login" });
                return;
              }
              openCreate();
            }}
          >
            {isLoggedIn ? "New Post" : "Sign in to Post"}
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

      <Group mb="lg" justify="space-between" align="flex-end">
        <Select
          label="Topic"
          placeholder="Filter by topic"
          data={allTags}
          value={activeTag}
          onChange={(value) => {
            if (value != null) {
              setActiveTag(value);
            }
          }}
          w={{ base: "100%", sm: 240 }}
        />
      </Group>

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
            <img src={post.image ?? threadPlaceholder} alt={post.title} className={imgStyles.cardImage} />
            <Group justify="space-between" wrap="wrap">
              <Group>
                <UserAvatar name={post.author} image={post.authorImage} color="pink" radius="xl" />
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
                <ThemeIcon variant="light" color={getVoteColor(post.userVote)} size="sm">
                  <IconArrowUp size={14} />
                </ThemeIcon>
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
