import { Container, Title, Text, Paper, Group, Stack, Badge, Button, Select, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { RowActionMenu } from "../../components/row-action-menu.tsx";
import { SectionHeader } from "../../components/section-header.tsx";
import { UserAvatar } from "../../components/user-avatar.tsx";
import { IconTrash, IconBan } from "../../lib/icons.tsx";
import { getUsers } from "../../server/admin.ts";
import { getReports, resolveReport, createBan } from "../../server/moderation.ts";

const reasonColors: Record<string, string> = { Harassment: "red", Spam: "orange", Misinformation: "yellow" };

const FEEDBACK_TIMEOUT_MS = 2000;

export const Route = createFileRoute("/_app/moderation")({
  loader: async () => {
    const [reports, users] = await Promise.all([getReports(), getUsers()]);
    return { reports, users };
  },
  head: () => ({ meta: [{ title: "Moderation | Adormable" }] }),
  component: ForumModerationPage,
});

function ForumModerationPage() {
  const { reports: flaggedPosts, users } = Route.useLoaderData();
  const router = useRouter();
  type FlaggedPost = (typeof flaggedPosts)[number];
  const [reviewTarget, setReviewTarget] = useState<FlaggedPost | null>(null);
  const [reviewOpened, { open: openReview, close: closeReview }] = useDisclosure(false);
  const [banUser, setBanUser] = useState<string | null>(null);
  const [banDuration, setBanDuration] = useState<string | null>(null);
  const [banIssued, setBanIssued] = useState(false);

  const durationMap: Record<string, number> = { "1 Day": 1, "3 Days": 3, "7 Days": 7, "14 Days": 14, "30 Days": 30 };

  const handleReview = (post: FlaggedPost) => {
    setReviewTarget(post);
    openReview();
  };

  return (
    <Container size="lg" py="xl" className="pageEnter">
      <SectionHeader title="Forum Moderation" description="Review flagged content and manage user behavior." />

      <Modal opened={reviewOpened} onClose={closeReview} title="Review Flagged Content" centered size="lg">
        {reviewTarget && (
          <Stack>
            <Group>
              {reviewTarget.reasons.map((reason) => (
                <Badge key={reason} color={reasonColors[reason] ?? "gray"} variant="light">
                  {reason}
                </Badge>
              ))}
              <Text size="sm" c="dimmed">
                {reviewTarget.reports} reports · {reviewTarget.date}
              </Text>
            </Group>
            <Text fw={600}>{reviewTarget.title}</Text>
            <Text size="sm" c="dimmed">
              Posted by {reviewTarget.author}
            </Text>
            <Text size="sm">{reviewTarget.excerpt}</Text>
            <Group justify="flex-end">
              <Button
                variant="light"
                color="gray"
                onClick={async () => {
                  await resolveReport({ data: { reportId: reviewTarget.id, action: "dismiss" } });
                  closeReview();
                  void router.invalidate();
                }}
              >
                Dismiss
              </Button>
              <Button
                color="red"
                radius="xl"
                onClick={async () => {
                  await resolveReport({ data: { reportId: reviewTarget.id, action: "delete" } });
                  closeReview();
                  void router.invalidate();
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
                  <UserAvatar name={post.author} image={post.authorImage} color="red" radius="xl" size="sm" />
                  <Stack gap={2}>
                    <Text fw={600}>{post.title}</Text>
                    <Text size="xs" c="dimmed">
                      By {post.author} · {post.date} · {post.reports} reports
                    </Text>
                  </Stack>
                </Group>
                <Group gap="xs">
                  <Badge color={reasonColors[post.primaryReason] ?? "gray"} variant="light">
                    {post.primaryReason}
                  </Badge>
                  <RowActionMenu
                    label="Review"
                    items={[
                      {
                        label: "Open review modal",
                        leftSection: <IconBan size={14} />,
                        onClick: () => {
                          handleReview(post);
                        },
                      },
                      {
                        label: "Remove flagged content",
                        color: "red",
                        leftSection: <IconTrash size={14} />,
                        onClick: async () => {
                          await resolveReport({ data: { reportId: post.id, action: "delete" } });
                          void router.invalidate();
                        },
                      },
                    ]}
                  />
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
            data={users.map((u) => ({
              value: u.id,
              label:
                u.status === "Banned" && u.activeBanExpiresAt != null
                  ? `${u.name} (banned until ${new Date(u.activeBanExpiresAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })})`
                  : u.name,
              disabled: u.status === "Banned",
            }))}
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
        <Text size="xs" c="dimmed" mt="xs">
          Active bans are enforced automatically and already-banned users are disabled in this picker.
        </Text>
        <Group justify="flex-end" mt="md" gap="sm">
          {banIssued && (
            <Text size="sm" c="green.6" fw={600}>
              Ban issued!
            </Text>
          )}
          <Button
            color="red"
            radius="xl"
            onClick={async () => {
              if (banUser == null || banDuration == null) {
                return;
              }
              await createBan({
                data: { userId: banUser, reason: "Manual ban", durationDays: durationMap[banDuration] },
              });
              setBanUser(null);
              setBanDuration(null);
              setBanIssued(true);
              setTimeout(() => {
                setBanIssued(false);
              }, FEEDBACK_TIMEOUT_MS);
              void router.invalidate();
            }}
          >
            Issue Ban
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
