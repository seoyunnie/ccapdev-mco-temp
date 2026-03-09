import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Avatar,
  Badge,
  Button,
  ActionIcon,
  Textarea,
  Divider,
} from "@mantine/core";
import { IconArrowUp, IconArrowDown, IconEdit, IconTrash } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import threadPlaceholder from "../../../assets/lobby/thread-placeholder.svg";
import { BackButton } from "../../../components/back-button.tsx";
import { EmptyState } from "../../../components/empty-state.tsx";

import imgStyles from "../../../components/shared-images.module.css";

const posts = [
  {
    id: "1",
    title: "Best study spots in the dorm?",
    author: "Maria Santos",
    time: "2 hours ago",
    tag: "Discussion",
    content: `I've been looking for quiet places to study after 9 PM. The main hall
gets really crowded around that time and I can't focus with all the noise.

Does anyone know of any hidden gems in the building? I tried the reading room
on the 4th floor but it closes at 8 PM.

Any suggestions would be greatly appreciated!`,
    upvotes: 24,
    isAuthor: true,
  },
  {
    id: "2",
    title: "Wi-Fi Issues on Floor 3",
    author: "Juan Reyes",
    time: "5 hours ago",
    tag: "Issue",
    content: `Anyone else experiencing slow internet on the 3rd floor? It's been like this for a week now.

I've tried resetting my router and switching between 2.4GHz and 5GHz but nothing works. Even basic web browsing is painfully slow.

If you're also affected, please report it to the admin office so they take action.`,
    upvotes: 42,
    isAuthor: false,
  },
  {
    id: "3",
    title: "Movie night this Saturday!",
    author: "Ava Cruz",
    time: "1 day ago",
    tag: "Event",
    content: `We're organizing a movie night in the common area this Saturday at 7 PM!

Bring your own snacks and blankets. We'll vote for the movie below — options include Marvel, Studio Ghibli, or a horror flick.

Everyone's welcome!`,
    upvotes: 67,
    isAuthor: false,
  },
  {
    id: "4",
    title: "Lost AirPods in laundry room",
    author: "Carlos Lim",
    time: "1 day ago",
    tag: "Lost & Found",
    content: `Left my AirPods Pro in the 2nd floor laundry room yesterday around 3 PM. White case with a blue sticker on the back.

If anyone found them, please DM me or drop them off at the concierge desk. Much appreciated!`,
    upvotes: 11,
    isAuthor: false,
  },
];

interface ThreadComment {
  id: string;
  author: string;
  time: string;
  content: string;
  upvotes: number;
  replies: { id: string; author: string; time: string; content: string; upvotes: number }[];
}

const commentsMap: Record<string, ThreadComment[]> = {
  "1": [
    {
      id: "c1",
      author: "Juan Reyes",
      time: "1 hour ago",
      content: "Try the rooftop area! It's usually empty after 8 PM and has decent lighting.",
      upvotes: 8,
      replies: [
        {
          id: "c1r1",
          author: "Maria Santos",
          time: "45 min ago",
          content: "Oh I didn't know we could go there! Thanks, I'll check it out!",
          upvotes: 2,
        },
      ],
    },
    {
      id: "c2",
      author: "Ava Cruz",
      time: "30 min ago",
      content: "The lobby lounge on the 2nd floor is pretty quiet at night. Plus it has power outlets everywhere.",
      upvotes: 5,
      replies: [],
    },
  ],
};

export const Route = createFileRoute("/_app/lobby/$threadId")({ component: ThreadViewPage });

function getVoteOffset(vote: "up" | "down" | null): number {
  if (vote === "up") {
    return 1;
  }
  if (vote === "down") {
    return -1;
  }
  return 0;
}

function getVoteColor(vote: "up" | "down" | null): string | undefined {
  if (vote === "up") {
    return "grape";
  }
  if (vote === "down") {
    return "red";
  }
  return undefined;
}

function ThreadViewPage() {
  const { threadId } = Route.useParams();
  const post = posts.find((p) => p.id === threadId);
  const comments = commentsMap[threadId] ?? [];

  const [postVote, setPostVote] = useState<"up" | "down" | null>(null);
  const [commentVotes, setCommentVotes] = useState<Record<string, "up" | "down" | null>>({});

  if (!post) {
    return (
      <Container size="md" py="xl">
        <BackButton to="/lobby" label="Back to Lobby" color="grape" />
        <EmptyState image={emptyState} message="Post not found." />
      </Container>
    );
  }

  const toggleCommentVote = (commentId: string, direction: "up" | "down") => {
    setCommentVotes((prev) => ({ ...prev, [commentId]: prev[commentId] === direction ? null : direction }));
  };

  return (
    <Container size="md" py="xl">
      <BackButton to="/lobby" label="Back to Lobby" color="grape" />

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="lg">
        <img src={threadPlaceholder} alt="Thread" className={imgStyles.cardImage} />
        <Group justify="space-between" mb="md">
          <Group>
            <Avatar color="grape" radius="xl">
              {post.author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar>
            <Stack gap={2}>
              <Group gap="xs">
                <Text fw={700}>{post.title}</Text>
                <Badge color="pink" size="sm" variant="light">
                  {post.tag}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {post.author} · {post.time}
              </Text>
            </Stack>
          </Group>
          {post.isAuthor && (
            <Group gap="xs">
              <ActionIcon variant="light" color="pink" size="sm">
                <IconEdit size={14} />
              </ActionIcon>
              <ActionIcon variant="light" color="red" size="sm">
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          )}
        </Group>
        <Text style={{ whiteSpace: "pre-line" }} mb="md">
          {post.content}
        </Text>
        <Group gap="xs">
          <ActionIcon
            variant={postVote === "up" ? "filled" : "light"}
            color="grape"
            onClick={() => {
              setPostVote((v) => (v === "up" ? null : "up"));
            }}
            aria-label="Upvote post"
          >
            <IconArrowUp size={16} />
          </ActionIcon>
          <Text fw={600} size="sm" c={getVoteColor(postVote)}>
            {post.upvotes + getVoteOffset(postVote)}
          </Text>
          <ActionIcon
            variant={postVote === "down" ? "filled" : "light"}
            color="red"
            onClick={() => {
              setPostVote((v) => (v === "down" ? null : "down"));
            }}
            aria-label="Downvote post"
          >
            <IconArrowDown size={16} />
          </ActionIcon>
        </Group>
      </Paper>

      <Paper shadow="sm" p="md" radius="md" className="content-card" mb="lg">
        <Textarea placeholder="Write a reply..." minRows={3} mb="sm" />
        <Button size="sm" color="pink" radius="xl">
          Post Reply
        </Button>
      </Paper>

      <Title order={4} mb="md">
        Comments ({comments.length})
      </Title>
      <Stack>
        {comments.map((comment) => {
          const vote = commentVotes[comment.id] ?? null;
          return (
            <Paper key={comment.id} withBorder p="md" radius="md">
              <Group mb="xs">
                <Avatar color="grape" radius="xl" size="sm">
                  {comment.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>
                <Text size="sm" fw={600}>
                  {comment.author}
                </Text>
                <Text size="xs" c="dimmed">
                  {comment.time}
                </Text>
              </Group>
              <Text size="sm" mb="xs">
                {comment.content}
              </Text>
              <Group gap="xs">
                <ActionIcon
                  variant={vote === "up" ? "filled" : "subtle"}
                  size="xs"
                  color="grape"
                  onClick={() => {
                    toggleCommentVote(comment.id, "up");
                  }}
                  aria-label="Upvote comment"
                >
                  <IconArrowUp size={12} />
                </ActionIcon>
                <Text size="xs" fw={500} c={getVoteColor(vote)}>
                  {comment.upvotes + getVoteOffset(vote)}
                </Text>
                <ActionIcon
                  variant={vote === "down" ? "filled" : "subtle"}
                  size="xs"
                  color="red"
                  onClick={() => {
                    toggleCommentVote(comment.id, "down");
                  }}
                  aria-label="Downvote comment"
                >
                  <IconArrowDown size={12} />
                </ActionIcon>
                <Button variant="subtle" size="xs">
                  Reply
                </Button>
              </Group>
              {comment.replies.length > 0 && (
                <>
                  <Divider my="sm" />
                  {comment.replies.map((reply) => (
                    <Paper key={reply.id} bg="pink.0" p="sm" radius="sm" ml="xl">
                      <Group mb={4}>
                        <Avatar color="grape" radius="xl" size="xs">
                          {reply.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar>
                        <Text size="xs" fw={600}>
                          {reply.author}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {reply.time}
                        </Text>
                      </Group>
                      <Text size="sm">{reply.content}</Text>
                    </Paper>
                  ))}
                </>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
}
