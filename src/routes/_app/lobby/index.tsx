import {
  Container,
  Text,
  Card,
  Group,
  Stack,
  Avatar,
  Badge,
  ActionIcon,
  Chip,
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  ColorSwatch,
  Paper,
  Divider,
  Tooltip,
  Progress,
  type DefaultMantineColor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconArrowUp, IconPlus, IconMessageCircle, IconTag, IconSettings } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import { EmptyState } from "../../../components/empty-state.tsx";
import { SearchBar } from "../../../components/search-bar.tsx";
import { SectionHeader } from "../../../components/section-header.tsx";
import { useAuth } from "../../../contexts/auth-context.tsx";
import { TAG_COLORS, DEFAULT_TAGS, CATEGORY_COLOR_OPTIONS } from "../../../features/lobby/lobby.constants.ts";

import styles from "./index.module.css";

interface Post {
  id: string;
  title: string;
  author: string;
  snippet: string;
  upvotes: number;
  comments: number;
  tag: string;
  time: string;
}

const SNIPPET_MAX_LENGTH = 120;
const CONTENT_MAX_LENGTH = 2000;
const TITLE_MAX_LENGTH = 100;
const PERCENT = 100;
const PROGRESS_DANGER_PCT = 90;
const PROGRESS_WARNING_PCT = 70;

const initialPosts: Post[] = [
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

export const Route = createFileRoute("/_app/lobby/")({
  head: () => ({ meta: [{ title: "Lobby | Adormable" }] }),
  component: ForumFeedPage,
});

function ForumFeedPage() {
  const { role } = useAuth();
  const isStaff = role === "admin" || role === "concierge";

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string | null>("Newest");
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [posts, setPosts] = useState(initialPosts);

  // New Post modal
  const [postModalOpened, { open: openPostModal, close: closePostModal }] = useDisclosure(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [postErrors, setPostErrors] = useState<Record<string, string>>({});

  // Custom categories (admin/concierge)
  const [customTags, setCustomTags] = useState<{ name: string; color: DefaultMantineColor }[]>([]);
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState<DefaultMantineColor>("blue");

  const allTagNames = [...DEFAULT_TAGS, ...customTags.map((t) => t.name)];
  const allTagColors: Record<string, DefaultMantineColor> = {
    ...TAG_COLORS,
    ...Object.fromEntries(customTags.map((t) => [t.name, t.color])),
  };

  const filtered = [...posts]
    .filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch = p.title.toLowerCase().includes(q) || p.snippet.toLowerCase().includes(q);
      const matchesTag = activeTag === "All" || p.tag === activeTag;
      return matchesSearch && matchesTag;
    })
    // oxlint-disable-next-line unicorn/no-array-sort
    .sort((a, b) => {
      if (sortBy === "Most Popular") {
        return b.upvotes - a.upvotes;
      }
      return 0;
    });

  const handleUpvote = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUpvoted((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const validatePost = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newTitle.trim()) {
      errors.title = "Title is required";
    } else if (newTitle.length > TITLE_MAX_LENGTH) {
      errors.title = `Title must be under ${TITLE_MAX_LENGTH} characters`;
    }
    if (newTag === null) {
      errors.tag = "Please select a category";
    }
    if (!newContent.trim()) {
      errors.content = "Content is required";
    } else if (newContent.length > CONTENT_MAX_LENGTH) {
      errors.content = `Content must be under ${CONTENT_MAX_LENGTH} characters`;
    }
    setPostErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewPost = () => {
    if (!validatePost()) {
      return;
    }
    const newPost: Post = {
      id: String(Date.now()),
      title: newTitle.trim(),
      author: "You",
      snippet: newContent.trim().slice(0, SNIPPET_MAX_LENGTH),
      upvotes: 0,
      comments: 0,
      tag: newTag!,
      time: "Just now",
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewTitle("");
    setNewTag(null);
    setNewContent("");
    setPostErrors({});
    closePostModal();
    notifications.show({
      title: "Post created",
      message: `"${newPost.title}" has been published to the lobby.`,
      color: "grape",
    });
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      return;
    }
    if (allTagNames.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      notifications.show({ title: "Duplicate", message: "A category with that name already exists.", color: "red" });
      return;
    }
    setCustomTags((prev) => [...prev, { name: trimmed, color: newCategoryColor }]);
    setNewCategoryName("");
    setNewCategoryColor("blue");
    closeCategoryModal();
    notifications.show({
      title: "Category added",
      message: `"${trimmed}" is now available as a post category.`,
      color: "teal",
    });
  };

  const handleRemoveCategory = (name: string) => {
    setCustomTags((prev) => prev.filter((t) => t.name !== name));
    notifications.show({ title: "Category removed", message: `"${name}" has been removed.`, color: "orange" });
  };

  const contentProgress = (newContent.length / CONTENT_MAX_LENGTH) * PERCENT;

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" align="flex-start" mb="xs">
        <SectionHeader
          title="The Virtual Lobby"
          description="Discuss, share, and connect with fellow dormitory residents."
          color="grape"
          mb="xs"
        />
        <Group gap="xs">
          {isStaff && (
            <Tooltip label="Manage Categories">
              <ActionIcon variant="light" color="grape" size="lg" radius="xl" onClick={openCategoryModal}>
                <IconSettings size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          <Button leftSection={<IconPlus size={16} />} color="grape" radius="xl" onClick={openPostModal}>
            New Post
          </Button>
        </Group>
      </Group>

      {}
      <Modal
        opened={postModalOpened}
        onClose={() => {
          closePostModal();
          setPostErrors({});
        }}
        title={
          <Group gap="xs">
            <IconPlus size={18} />
            <Text fw={600}>Create New Post</Text>
          </Group>
        }
        centered
        size="lg"
        overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Give your post a clear, descriptive title"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.currentTarget.value);
              if (postErrors.title) {
                setPostErrors((p) => ({ ...p, title: "" }));
              }
            }}
            error={postErrors.title}
            maxLength={TITLE_MAX_LENGTH}
            required
            rightSection={
              <Text size="xs" c="dimmed">
                {newTitle.length}/{TITLE_MAX_LENGTH}
              </Text>
            }
            rightSectionWidth={60}
          />

          <Select
            label="Category"
            placeholder="Choose a category for your post"
            data={allTagNames.map((t) => ({ value: t, label: t }))}
            value={newTag}
            onChange={(v) => {
              setNewTag(v);
              if (postErrors.tag) {
                setPostErrors((p) => ({ ...p, tag: "" }));
              }
            }}
            error={postErrors.tag}
            leftSection={<IconTag size={16} />}
            required
            renderOption={({ option }) => (
              <Group gap="xs">
                <Badge
                  color={allTagColors[option.value] ?? "gray"}
                  size="xs"
                  variant="light"
                  circle
                  w={8}
                  h={8}
                  p={0}
                />
                <Text size="sm">{option.label}</Text>
              </Group>
            )}
          />

          <div>
            <Textarea
              label="Content"
              placeholder="Share your thoughts, questions, or announcements..."
              minRows={6}
              maxRows={12}
              autosize
              value={newContent}
              onChange={(e) => {
                setNewContent(e.currentTarget.value);
                if (postErrors.content) {
                  setPostErrors((p) => ({ ...p, content: "" }));
                }
              }}
              error={postErrors.content}
              required
            />
            <Group justify="space-between" mt={4}>
              <Progress
                value={contentProgress}
                size="xs"
                color={(() => {
                  if (contentProgress > PROGRESS_DANGER_PCT) {
                    return "red";
                  }
                  if (contentProgress > PROGRESS_WARNING_PCT) {
                    return "yellow";
                  }
                  return "grape";
                })()}
                style={{ flex: 1, maxWidth: 200 }}
              />
              <Text size="xs" c={newContent.length > CONTENT_MAX_LENGTH ? "red" : "dimmed"}>
                {newContent.length}/{CONTENT_MAX_LENGTH}
              </Text>
            </Group>
          </div>

          {newTitle.trim() && newContent.trim() && (
            <>
              <Divider label="Preview" labelPosition="center" />
              <Paper withBorder p="sm" radius="md" bg="gray.0">
                <Group gap="xs" mb={4}>
                  <Avatar color="grape" radius="xl" size="xs">
                    Y
                  </Avatar>
                  <Text size="xs" c="dimmed">
                    You · Just now
                  </Text>
                  {newTag != null && (
                    <Badge color={allTagColors[newTag] ?? "gray"} size="xs" variant="light">
                      {newTag}
                    </Badge>
                  )}
                </Group>
                <Text size="sm" fw={600} mb={2}>
                  {newTitle}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={2}>
                  {newContent}
                </Text>
              </Paper>
            </>
          )}

          <Group justify="flex-end" mt="xs">
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                closePostModal();
                setPostErrors({});
              }}
            >
              Cancel
            </Button>
            <Button color="grape" radius="xl" onClick={handleNewPost} leftSection={<IconPlus size={14} />}>
              Publish Post
            </Button>
          </Group>
        </Stack>
      </Modal>

      {}
      <Modal
        opened={categoryModalOpened}
        onClose={closeCategoryModal}
        title={
          <Group gap="xs">
            <IconSettings size={18} />
            <Text fw={600}>Manage Categories</Text>
          </Group>
        }
        centered
        overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
      >
        <Stack gap="md">
          <div>
            <Text size="sm" fw={600} mb="xs">
              Default Categories
            </Text>
            <Group gap="xs">
              {DEFAULT_TAGS.map((tag) => (
                <Badge key={tag} color={TAG_COLORS[tag]} variant="light" size="md">
                  {tag}
                </Badge>
              ))}
            </Group>
          </div>

          {customTags.length > 0 && (
            <div>
              <Text size="sm" fw={600} mb="xs">
                Custom Categories
              </Text>
              <Stack gap="xs">
                {customTags.map((tag) => (
                  <Group key={tag.name} justify="space-between">
                    <Badge color={tag.color} variant="light" size="md">
                      {tag.name}
                    </Badge>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => {
                        handleRemoveCategory(tag.name);
                      }}
                    >
                      Remove
                    </Button>
                  </Group>
                ))}
              </Stack>
            </div>
          )}

          <Divider label="Add New Category" labelPosition="center" />

          <TextInput
            label="Category Name"
            placeholder="e.g. Announcement, Suggestion"
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.currentTarget.value);
            }}
            maxLength={30}
          />

          <div>
            <Text size="sm" fw={500} mb={4}>
              Color
            </Text>
            <Group gap="xs">
              {CATEGORY_COLOR_OPTIONS.map((color) => (
                <Tooltip key={color} label={color} withArrow>
                  <ColorSwatch
                    color={`var(--mantine-color-${color}-6)`}
                    size={28}
                    onClick={() => {
                      setNewCategoryColor(color);
                    }}
                    style={{
                      cursor: "pointer",
                      outline: newCategoryColor === color ? "2px solid var(--mantine-color-grape-6)" : "none",
                      outlineOffset: 2,
                    }}
                  />
                </Tooltip>
              ))}
            </Group>
          </div>

          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={closeCategoryModal}>
              Done
            </Button>
            <Button
              color="grape"
              radius="xl"
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              leftSection={<IconPlus size={14} />}
            >
              Add Category
            </Button>
          </Group>
        </Stack>
      </Modal>

      <SearchBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search posts..."
        filterData={["Newest", "Most Popular"]}
        filterPlaceholder="Sort by"
        filterValue={sortBy}
        onFilterChange={setSortBy}
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
          <Chip value="All" variant="light" color="gray" size="sm">
            All
          </Chip>
          {allTagNames.map((tag) => (
            <Chip key={tag} value={tag} variant="light" color={allTagColors[tag] ?? "gray"} size="sm">
              {tag}
            </Chip>
          ))}
        </Group>
      </Chip.Group>

      {filtered.length === 0 && (
        <EmptyState
          image={emptyState}
          message={search ? "No posts match your search." : "No posts in this category yet."}
        />
      )}

      <Stack>
        {filtered.map((post) => {
          const isUpvoted = upvoted.has(post.id);
          const displayUpvotes = post.upvotes + (isUpvoted ? 1 : 0);
          return (
            <Card
              key={post.id}
              shadow="sm"
              padding="md"
              radius="md"
              className={styles.postCard}
              component={Link}
              to={`/lobby/${post.id}`}
            >
              <Group wrap="nowrap" gap="md">
                <Stack align="center" gap={2} className={styles.voteColumn}>
                  <ActionIcon
                    variant={isUpvoted ? "filled" : "subtle"}
                    color="grape"
                    size="sm"
                    aria-label="Upvote"
                    onClick={(e) => {
                      handleUpvote(post.id, e);
                    }}
                    className={styles.voteButton}
                  >
                    <IconArrowUp size={16} />
                  </ActionIcon>
                  <Text size="sm" fw={700} c={isUpvoted ? "grape" : "dimmed"}>
                    {displayUpvotes}
                  </Text>
                </Stack>

                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="xs" wrap="nowrap">
                    <Avatar color="grape" radius="xl" size="sm">
                      {post.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                    <Text size="xs" c="dimmed">
                      {post.author} · {post.time}
                    </Text>
                  </Group>
                  <Group gap="xs" wrap="nowrap">
                    <Text fw={600} size="sm" lineClamp={1}>
                      {post.title}
                    </Text>
                    <Badge color={allTagColors[post.tag] ?? "gray"} size="xs" variant="light" style={{ flexShrink: 0 }}>
                      {post.tag}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {post.snippet}
                  </Text>
                  <Group gap="xs">
                    <IconMessageCircle size={12} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed">
                      {post.comments} replies
                    </Text>
                  </Group>
                </Stack>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
}
