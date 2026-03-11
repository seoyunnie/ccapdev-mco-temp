import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Button,
  ActionIcon,
  Textarea,
  Divider,
  Modal,
  TextInput,
  Select,
  FileInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import threadPlaceholder from "../../../assets/lobby/thread-placeholder.svg";
import { BackButton } from "../../../components/back-button.tsx";
import { EmptyState } from "../../../components/empty-state.tsx";
import { DetailSkeleton } from "../../../components/page-skeleton.tsx";
import { UserAvatar } from "../../../components/user-avatar.tsx";
import { TAG_COLORS } from "../../../features/lobby/lobby.constants.ts";
import { useAuth } from "../../../lib/auth-context.tsx";
import { IconArrowDown, IconArrowUp, IconEdit, IconFlag, IconPhoto, IconTrash } from "../../../lib/icons.tsx";
import { createReport } from "../../../server/moderation.ts";
import {
  getThread,
  createComment,
  voteThread,
  voteComment,
  deleteThread,
  deleteComment,
  updateThread,
} from "../../../server/threads.ts";

export const Route = createFileRoute("/_app/lobby/$threadId")({
  loader: ({ params }) => getThread({ data: { threadId: params.threadId } }),
  head: () => ({ meta: [{ title: "Thread | Adormable" }] }),
  pendingComponent: DetailSkeleton,
  errorComponent: () => <EmptyState image={emptyState} message="Thread not found." />,
  component: ThreadViewPage,
});

function getVoteColor(vote: number) {
  if (vote === 1) {
    return "pink";
  }

  if (vote === -1) {
    return "red";
  }

  return null;
}

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
  const [editImage, setEditImage] = useState<string | null>(data.image ?? null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportTarget, setReportTarget] = useState<{ threadId?: string; commentId?: string }>({});
  const [submittingReport, setSubmittingReport] = useState(false);

  return (
    <Container size="md" py="xl" className="pageEnter">
      {/* Edit Thread Modal */}
      <Modal
        opened={editOpen}
        onClose={() => {
          setEditOpen(false);
        }}
        title="Edit Thread"
        centered
      >
        <Stack>
          <TextInput
            label="Title"
            value={editTitle}
            onChange={(e) => {
              setEditTitle(e.currentTarget.value);
            }}
          />
          <Select label="Tag" data={Object.keys(TAG_COLORS)} value={editTag} onChange={setEditTag} />
          <FileInput
            label="Thread image"
            placeholder="Replace thread image"
            leftSection={<IconPhoto size={16} />}
            accept="image/*"
            onChange={(file) => {
              if (file == null) {
                setEditImage(null);
                return;
              }
              const reader = new FileReader();
              reader.addEventListener("load", () => {
                if (typeof reader.result === "string") {
                  setEditImage(reader.result);
                }
              });
              reader.readAsDataURL(file);
            }}
          />
          <Textarea
            label="Content"
            minRows={4}
            value={editContent}
            onChange={(e) => {
              setEditContent(e.currentTarget.value);
            }}
          />
          <Group justify="flex-end">
            <Button
              color="pink"
              radius="xl"
              onClick={async () => {
                await updateThread({
                  data: {
                    threadId: data.id,
                    title: editTitle,
                    content: editContent,
                    tag: editTag ?? undefined,
                    image: editImage,
                  },
                });
                setEditOpen(false);
                void router.invalidate();
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
        onClose={() => {
          setReportOpen(false);
          setReportReason("");
          setReportTarget({});
        }}
        title="Report Content"
        centered
      >
        <Stack>
          <Textarea
            label="Reason"
            placeholder="Why are you reporting this?"
            minRows={3}
            value={reportReason}
            onChange={(e) => {
              setReportReason(e.currentTarget.value);
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setReportOpen(false);
                setReportReason("");
                setReportTarget({});
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              radius="xl"
              loading={submittingReport}
              onClick={async () => {
                if (!reportReason.trim()) {
                  notifications.show({
                    title: "Reason required",
                    message: "Add a short explanation before submitting a report.",
                    color: "red",
                  });
                  return;
                }
                setSubmittingReport(true);
                try {
                  await createReport({ data: { ...reportTarget, reason: reportReason.trim() } });
                  setReportOpen(false);
                  setReportReason("");
                  setReportTarget({});
                  notifications.show({
                    title: "Report submitted",
                    message: "Thanks. A moderator can review this content now.",
                    color: "green",
                  });
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Could not submit the report.";
                  notifications.show({ title: "Report failed", message, color: "red" });
                } finally {
                  setSubmittingReport(false);
                }
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
            <UserAvatar name={data.author} image={data.authorImage} color="pink" radius="xl" />
            <Stack gap={2}>
              <Group gap="xs">
                <Text fw={700}>{data.title}</Text>
                <Badge color={TAG_COLORS[data.tag] ?? "gray"} size="sm" variant="light">
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
              <ActionIcon
                variant="light"
                color="pink"
                size="sm"
                aria-label="Edit thread"
                onClick={() => {
                  setEditOpen(true);
                }}
              >
                <IconEdit size={14} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                aria-label="Delete thread"
                onClick={async () => {
                  if (!confirm("Delete this thread?")) {
                    return;
                  }
                  await deleteThread({ data: { threadId: data.id } });
                  void router.navigate({ to: "/lobby" });
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          )}
        </Group>
        <img
          src={data.image ?? threadPlaceholder}
          alt={data.title}
          style={{ width: "100%", borderRadius: 16, marginBottom: 16, objectFit: "cover", maxHeight: 280 }}
        />
        <Text style={{ whiteSpace: "pre-line" }} mb="md">
          {data.content}
        </Text>
        <Group>
          <ActionIcon
            variant={data.userVote === 1 ? "filled" : "light"}
            color="pink"
            disabled={!isLoggedIn}
            aria-label="Upvote thread"
            onClick={async () => {
              await voteThread({ data: { threadId: data.id, value: 1 } });
              void router.invalidate();
            }}
          >
            <IconArrowUp size={16} />
          </ActionIcon>
          <Text fw={600} c={getVoteColor(data.userVote) ?? undefined}>
            {data.upvotes}
          </Text>
          <ActionIcon
            variant={data.userVote === -1 ? "filled" : "light"}
            color="red"
            disabled={!isLoggedIn}
            aria-label="Downvote thread"
            onClick={async () => {
              await voteThread({ data: { threadId: data.id, value: -1 } });
              void router.invalidate();
            }}
          >
            <IconArrowDown size={16} />
          </ActionIcon>
          {isLoggedIn && !data.isAuthor && (
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label="Report thread"
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
          disabled={!isLoggedIn}
          value={replyContent}
          onChange={(e) => {
            setReplyContent(e.currentTarget.value);
          }}
        />
        <Button
          size="sm"
          color="pink"
          radius="xl"
          disabled={!isLoggedIn}
          onClick={async () => {
            if (!replyContent.trim()) {
              return;
            }
            await createComment({ data: { threadId: data.id, content: replyContent } });
            setReplyContent("");
            void router.invalidate();
          }}
        >
          {isLoggedIn ? "Post Reply" : "Sign in to Reply"}
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
              <UserAvatar name={comment.author} image={comment.authorImage} color="pink" radius="xl" size="sm" />
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
                variant={comment.userVote === 1 ? "filled" : "subtle"}
                color="pink"
                size="xs"
                disabled={!isLoggedIn}
                aria-label="Upvote comment"
                onClick={async () => {
                  await voteComment({ data: { commentId: comment.id, value: 1 } });
                  void router.invalidate();
                }}
              >
                <IconArrowUp size={12} />
              </ActionIcon>
              <Text size="xs" c={getVoteColor(comment.userVote) ?? undefined}>
                {comment.upvotes}
              </Text>
              <ActionIcon
                variant={comment.userVote === -1 ? "filled" : "subtle"}
                color="red"
                size="xs"
                disabled={!isLoggedIn}
                aria-label="Downvote comment"
                onClick={async () => {
                  await voteComment({ data: { commentId: comment.id, value: -1 } });
                  void router.invalidate();
                }}
              >
                <IconArrowDown size={12} />
              </ActionIcon>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => {
                  setCommentReplyId(commentReplyId === comment.id ? null : comment.id);
                }}
              >
                Reply
              </Button>
              {isLoggedIn && (
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  color="red"
                  aria-label="Report comment"
                  onClick={() => {
                    setReportTarget({ commentId: comment.id });
                    setReportOpen(true);
                  }}
                >
                  <IconFlag size={12} />
                </ActionIcon>
              )}
              {comment.isAuthor && (
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  color="red"
                  aria-label="Delete comment"
                  onClick={async () => {
                    if (!confirm("Delete this comment?")) {
                      return;
                    }
                    await deleteComment({ data: { commentId: comment.id } });
                    void router.invalidate();
                  }}
                >
                  <IconTrash size={12} />
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
                  onChange={(e) => {
                    setCommentReplyContent(e.currentTarget.value);
                  }}
                />
                <Group>
                  <Button
                    size="xs"
                    color="pink"
                    radius="xl"
                    onClick={async () => {
                      if (!commentReplyContent.trim()) {
                        return;
                      }
                      await createComment({
                        data: { threadId: data.id, content: commentReplyContent, parentId: comment.id },
                      });
                      setCommentReplyContent("");
                      setCommentReplyId(null);
                      void router.invalidate();
                    }}
                  >
                    Post Reply
                  </Button>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      setCommentReplyId(null);
                    }}
                  >
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
                      <UserAvatar name={reply.author} image={reply.authorImage} color="pink" radius="xl" size="xs" />
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
