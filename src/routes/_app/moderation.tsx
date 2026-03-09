import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Button,
  Avatar,
  ActionIcon,
  Select,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash, IconBan } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SectionHeader } from "../../components/section-header.tsx";

const initialFlaggedPosts = [
  {
    id: "f1",
    title: "Inappropriate content in thread",
    author: "User123",
    reason: "Harassment",
    reports: 5,
    date: "Feb 8, 2026",
    content: "This thread contains language that violates community guidelines regarding harassment.",
  },
  {
    id: "f2",
    title: "Spam link posted repeatedly",
    author: "SpamBot42",
    reason: "Spam",
    reports: 12,
    date: "Feb 7, 2026",
    content: "Repeated posting of external links that appear to be spam/phishing.",
  },
  {
    id: "f3",
    title: "Misleading review on Café Manila",
    author: "FakeReviewer",
    reason: "Misinformation",
    reports: 3,
    date: "Feb 6, 2026",
    content: "Review contains fabricated claims about the establishment that are verifiably false.",
  },
];

const reasonColors: Record<string, string> = { Harassment: "red", Spam: "orange", Misinformation: "yellow" };

const FEEDBACK_TIMEOUT_MS = 2000;

export const Route = createFileRoute("/_app/moderation")({
  head: () => ({ meta: [{ title: "Moderation | Adormable" }] }),
  component: ForumModerationPage,
});

function ForumModerationPage() {
  const [flaggedPosts, setFlaggedPosts] = useState(initialFlaggedPosts);
  const [reviewTarget, setReviewTarget] = useState<(typeof initialFlaggedPosts)[number] | null>(null);
  const [reviewOpened, { open: openReview, close: closeReview }] = useDisclosure(false);
  const [banUser, setBanUser] = useState<string | null>(null);
  const [banDuration, setBanDuration] = useState<string | null>(null);
  const [banIssued, setBanIssued] = useState(false);

  const handleReview = (post: (typeof initialFlaggedPosts)[number]) => {
    setReviewTarget(post);
    openReview();
  };

  const handleDelete = (id: string) => {
    setFlaggedPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleIssueBan = () => {
    if (banUser === null || banDuration === null) {
      return;
    }
    setBanIssued(true);
    setBanUser(null);
    setBanDuration(null);
    setTimeout(() => {
      setBanIssued(false);
    }, FEEDBACK_TIMEOUT_MS);
  };

  return (
    <Container size="lg" py="xl">
      <SectionHeader title="Forum Moderation" description="Review flagged content and manage user behavior." />

      <Modal opened={reviewOpened} onClose={closeReview} title="Review Flagged Content" centered size="lg">
        {reviewTarget && (
          <Stack>
            <Group>
              <Badge color={reasonColors[reviewTarget.reason]} variant="light">
                {reviewTarget.reason}
              </Badge>
              <Text size="sm" c="dimmed">
                {reviewTarget.reports} reports · {reviewTarget.date}
              </Text>
            </Group>
            <Text fw={600}>{reviewTarget.title}</Text>
            <Text size="sm" c="dimmed">
              Posted by {reviewTarget.author}
            </Text>
            <Paper bg="gray.0" p="md" radius="md">
              <Text size="sm">{reviewTarget.content}</Text>
            </Paper>
            <Group justify="flex-end">
              <Button variant="light" color="gray" onClick={closeReview}>
                Dismiss
              </Button>
              <Button
                color="red"
                radius="xl"
                onClick={() => {
                  handleDelete(reviewTarget.id);
                  closeReview();
                }}
              >
                Remove Content
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="xl">
        <Title order={4} mb="md">
          Report Queue ({flaggedPosts.length})
        </Title>

        <Stack>
          {flaggedPosts.map((post) => (
            <Paper key={post.id} withBorder p="md" radius="md">
              <Group justify="space-between" wrap="wrap">
                <Group>
                  <Avatar color="red" radius="xl" size="sm">
                    {/* oxlint-disable-next-line no-magic-numbers */}
                    {post.author.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Stack gap={2}>
                    <Text fw={600}>{post.title}</Text>
                    <Text size="xs" c="dimmed">
                      By {post.author} · {post.date} · {post.reports} reports
                    </Text>
                  </Stack>
                </Group>
                <Group gap="xs">
                  <Badge color={reasonColors[post.reason]} variant="light">
                    {post.reason}
                  </Badge>
                  <Button
                    size="xs"
                    variant="light"
                    color="pink"
                    onClick={() => {
                      handleReview(post);
                    }}
                  >
                    Review
                  </Button>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => {
                      handleDelete(post.id);
                    }}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
          {flaggedPosts.length === 0 && (
            <Text c="dimmed" ta="center" py="md">
              No flagged content to review.
            </Text>
          )}
        </Stack>
      </Paper>

      <Paper shadow="md" p="lg" radius="md" className="content-card">
        <Title order={4} mb="md">
          <Group gap="xs">
            <IconBan size={18} />
            Issue Temporary Ban
          </Group>
        </Title>
        <Group grow>
          <Select
            label="Select User"
            placeholder="Search user..."
            data={["User123", "SpamBot42", "FakeReviewer"]}
            searchable
            value={banUser}
            onChange={setBanUser}
          />
          <Select
            label="Ban Duration"
            placeholder="Select duration"
            data={["1 Day", "3 Days", "7 Days", "14 Days", "30 Days"]}
            value={banDuration}
            onChange={setBanDuration}
          />
        </Group>
        <Group justify="flex-end" mt="md" gap="sm">
          {banIssued && (
            <Text size="sm" c="green.6" fw={600}>
              Ban issued!
            </Text>
          )}
          <Button color="red" radius="xl" onClick={handleIssueBan}>
            Issue Ban
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
