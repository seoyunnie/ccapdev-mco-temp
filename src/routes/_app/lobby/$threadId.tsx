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

import defaultAvatarFemale from "../../../assets/avatars/default-avatar-female.svg";
import defaultAvatarMale from "../../../assets/avatars/default-avatar-male.svg";
import threadPlaceholder from "../../../assets/lobby/thread-placeholder.svg";
import { BackButton } from "../../../components/back-button.tsx";

import imgStyles from "../../../components/shared-images.module.css";

const post = {
  title: "Best study spots in the dorm?",
  author: "Maria Santos",
  avatar: defaultAvatarFemale,
  time: "2 hours ago",
  tag: "Discussion",
  content: `I've been looking for quiet places to study after 9 PM. The main hall
gets really crowded around that time and I can't focus with all the noise.

Does anyone know of any hidden gems in the building? I tried the reading room
on the 4th floor but it closes at 8 PM.

Any suggestions would be greatly appreciated!`,
  upvotes: 24,
  isAuthor: true,
};

const comments = [
  {
    id: "c1",
    author: "Juan Reyes",
    avatar: defaultAvatarMale,
    time: "1 hour ago",
    content: "Try the rooftop area! It's usually empty after 8 PM and has decent lighting.",
    upvotes: 8,
    replies: [
      {
        id: "c1r1",
        author: "Maria Santos",
        avatar: defaultAvatarFemale,
        time: "45 min ago",
        content: "Oh I didn't know we could go there! Thanks, I'll check it out!",
        upvotes: 2,
      },
    ],
  },
  {
    id: "c2",
    author: "Ava Cruz",
    avatar: defaultAvatarFemale,
    time: "30 min ago",
    content: "The lobby lounge on the 2nd floor is pretty quiet at night. Plus it has power outlets everywhere.",
    upvotes: 5,
    replies: [],
  },
];

export const Route = createFileRoute("/_app/lobby/$threadId")({ component: ThreadViewPage });

function ThreadViewPage() {
  return (
    <Container size="md" py="xl">
      <BackButton to="/lobby" label="Back to Lobby" color="grape" />

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="lg">
        <img src={threadPlaceholder} alt="Thread" className={imgStyles.cardImage} />
        <Group justify="space-between" mb="md">
          <Group>
            <Avatar src={post.avatar} alt={post.author} radius="xl" />
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
        <Group>
          <ActionIcon variant="light" color="pink">
            <IconArrowUp size={16} />
          </ActionIcon>
          <Text fw={600}>{post.upvotes}</Text>
          <ActionIcon variant="light" color="gray">
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
        {comments.map((comment) => (
          <Paper key={comment.id} withBorder p="md" radius="md">
            <Group mb="xs">
              <Avatar src={comment.avatar} alt={comment.author} radius="xl" size="sm" />
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
              <ActionIcon variant="subtle" size="xs">
                <IconArrowUp size={12} />
              </ActionIcon>
              <Text size="xs">{comment.upvotes}</Text>
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
                      <Avatar src={reply.avatar} alt={reply.author} radius="xl" size="xs" />
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
        ))}
      </Stack>
    </Container>
  );
}
