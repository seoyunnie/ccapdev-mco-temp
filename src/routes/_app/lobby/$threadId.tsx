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
  Modal,
  TextInput,
  Select,
} from "@mantine/core";
import { IconArrowUp, IconArrowDown, IconEdit, IconTrash, IconFlag } from "@tabler/icons-react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import { BackButton } from "../../../components/back-button.tsx";
import { EmptyState } from "../../../components/empty-state.tsx";
import { useAuth } from "../../../contexts/auth-context.tsx";
import { TAG_COLORS } from "../../../features/lobby/lobby.constants.ts";
import { createReport } from "../../../server/moderation.ts";
import {
  getThread,
  createComment,
  voteThread,
  voteComment,
  deleteThread,
  updateThread,
} from "../../../server/threads.ts";

export const Route = createFileRoute("/_app/lobby/$threadId")({
  loader: ({ params }) => getThread({ data: { threadId: params.threadId } }),
  errorComponent: () => (
    <EmptyState image={emptyState} message="Thread not found." />
  ),
  component: ThreadViewPage,
});

function ThreadViewPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [commentReplyId, setCommentReplyId] = useState<string | null>(null);
  const [commentReplyContent, setCommentReplyContent] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title);
  const [editContent, setEditContent] = useState(data.content);
  const [editTag, setEditTag] = useState<string | null>(data.tag);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportTarget, setReportTarget] = useState<{ threadId?: string; commentId?: string }>({});

  return (
    <Container size="md" py="xl">
      {/* Edit Thread Modal */}
      <Modal opened={editOpen} onClose={() => { setEditOpen(false); }} title="Edit Thread" centered>
        <Stack>
          <TextInput label="Title" value={editTitle} onChange={(e) => { setEditTitle(e.currentTarget.value); }} />
          <Select label="Tag" data={Object.keys(TAG_COLORS)} value={editTag} onChange={setEditTag} />
          <Textarea label="Content" minRows={4} value={editContent} onChange={(e) => { setEditContent(e.currentTarget.value); }} />
          <Group justify="flex-end">
            <Button
              color="pink"
              radius="xl"
              onClick={async () => {
                await updateThread({ data: { threadId: data.id, title: editTitle, content: editContent, tag: editTag ?? undefined } });
                setEditOpen(false);
                router.invalidate();
              }}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Report Modal */}
      <Modal
        opened={reportOpen}
        onClose={() => { setReportOpen(false); setReportReason(""); }}
        title="Report Content"
        centered
      >
        <Stack>
          <Textarea
            label="Reason"
            placeholder="Why are you reporting this?"
            minRows={3}
            value={reportReason}
            onChange={(e) => { setReportReason(e.currentTarget.value); }}
          />
          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={() => { setReportOpen(false); setReportReason(""); }}>
              Cancel
            </Button>
            <Button
              color="red"
              radius="xl"
              onClick={async () => {
                if (!reportReason.trim()) return;
                await createReport({ data: { ...reportTarget, reason: reportReason } });
                setReportOpen(false);
                setReportReason("");
              }}
            >
              Submit Report
            </Button>
          </Group>
        </Stack>
      </Modal>

      <BackButton to="/lobby" label="Back to Lobby" color="grape" />

      {/* Thread Content */}
      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <Avatar color="pink" radius="xl">
              {data.author
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </Avatar>
            <Stack gap={2}>
              <Group gap="xs">
                <Text fw={700}>{data.title}</Text>
                <Badge color={TAG_COLORS[data.tag as keyof typeof TAG_COLORS] ?? "gray"} size="sm" variant="light">
                  {data.tag}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {data.author} · {data.time}
              </Text>
            </Stack>
          </Group>
          {data.isAuthor && (
            <Group gap="xs">
              <ActionIcon variant="light" color="pink" size="sm" onClick={() => { setEditOpen(true); }}>
                <IconEdit size={14} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                onClick={async () => {
                  if (!confirm("Delete this thread?")) return;
                  await deleteThread({ data: { threadId: data.id } });
                  void router.navigate({ to: "/lobby" });
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          )}
        </Group>
        <Text style={{ whiteSpace: "pre-line" }} mb="md">
          {data.content}
        </Text>
        <Group>
          <ActionIcon
            variant="light"
            color="pink"
            onClick={async () => {
              await voteThread({ data: { threadId: data.id, value: 1 } });
              router.invalidate();
            }}
          >
            <IconArrowUp size={16} />
          </ActionIcon>
          <Text fw={600}>{data.upvotes}</Text>
          <ActionIcon
            variant="light"
            color="gray"
            onClick={async () => {
              await voteThread({ data: { threadId: data.id, value: -1 } });
              router.invalidate();
            }}
          >
            <IconArrowDown size={16} />
          </ActionIcon>
          {isLoggedIn && !data.isAuthor && (
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => {
                setReportTarget({ threadId: data.id });
                setReportOpen(true);
              }}
            >
              <IconFlag size={16} />
            </ActionIcon>
          )}
        </Group>
      </Paper>

      {/* Reply Box */}
      <Paper shadow="sm" p="md" radius="md" className="content-card" mb="lg">
        <Textarea
          placeholder="Write a reply..."
          minRows={3}
          mb="sm"
          value={replyContent}
          onChange={(e) => { setReplyContent(e.currentTarget.value); }}
        />
        <Button
          size="sm"
          color="pink"
          radius="xl"
          onClick={async () => {
            if (!replyContent.trim()) return;
            await createComment({ data: { threadId: data.id, content: replyContent } });
            setReplyContent("");
            router.invalidate();
          }}
        >
          Post Reply
        </Button>
      </Paper>

      {/* Comments */}
      <Title order={4} mb="md">
        Comments ({data.comments.length})
      </Title>
      <Stack>
        {data.comments.map((comment: (typeof data.comments)[number]) => (
          <Paper key={comment.id} withBorder p="md" radius="md">
            <Group mb="xs">
              <Avatar color="pink" radius="xl" size="sm">
                {comment.author
                  .split(" ")
                  .map((n: string) => n[0])
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
                variant="subtle"
                size="xs"
                onClick={async () => {
                  await voteComment({ data: { commentId: comment.id, value: 1 } });
                  router.invalidate();
                }}
              >
                <IconArrowUp size={12} />
              </ActionIcon>
              <Text size="xs">{comment.upvotes}</Text>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => { setCommentReplyId(commentReplyId === comment.id ? null : comment.id); }}
              >
                Reply
              </Button>
              {isLoggedIn && (
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  color="red"
                  onClick={() => {
                    setReportTarget({ commentId: comment.id });
                    setReportOpen(true);
                  }}
                >
                  <IconFlag size={12} />
                </ActionIcon>
              )}
            </Group>
            {commentReplyId === comment.id && (
              <Stack mt="xs" gap="xs">
                <Textarea
                  placeholder="Write a reply..."
                  minRows={2}
                  size="sm"
                  value={commentReplyContent}
                  onChange={(e) => { setCommentReplyContent(e.currentTarget.value); }}
                />
                <Group>
                  <Button
                    size="xs"
                    color="pink"
                    radius="xl"
                    onClick={async () => {
                      if (!commentReplyContent.trim()) return;
                      await createComment({ data: { threadId: data.id, content: commentReplyContent, parentId: comment.id } });
                      setCommentReplyContent("");
                      setCommentReplyId(null);
                      router.invalidate();
                    }}
                  >
                    Post Reply
                  </Button>
                  <Button size="xs" variant="subtle" color="gray" onClick={() => { setCommentReplyId(null); }}>
                    Cancel
                  </Button>
                </Group>
              </Stack>
            )}
            {comment.replies.length > 0 && (
              <>
                <Divider my="sm" />
                {comment.replies.map((reply: (typeof comment.replies)[number]) => (
                  <Paper key={reply.id} bg="pink.0" p="sm" radius="sm" ml="xl">
                    <Group mb={4}>
                      <Avatar color="pink" radius="xl" size="xs">
                        {reply.author
                          .split(" ")
                          .map((n: string) => n[0])
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
        ))}
      </Stack>
    </Container>
  );
}
