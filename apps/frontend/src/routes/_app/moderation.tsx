import { Container, Title, Text, Paper, Group, Stack, Badge, Button, Avatar, ActionIcon, Select } from "@mantine/core";
import { IconTrash, IconBan } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

const flaggedPosts = [
  {
    id: "f1",
    title: "Inappropriate content in thread",
    author: "User123",
    reason: "Harassment",
    reports: 5,
    date: "Feb 8, 2026",
  },
  {
    id: "f2",
    title: "Spam link posted repeatedly",
    author: "SpamBot42",
    reason: "Spam",
    reports: 12,
    date: "Feb 7, 2026",
  },
  {
    id: "f3",
    title: "Misleading review on Café Manila",
    author: "FakeReviewer",
    reason: "Misinformation",
    reports: 3,
    date: "Feb 6, 2026",
  },
];

const reasonColors: Record<string, string> = { Harassment: "red", Spam: "orange", Misinformation: "yellow" };

export const Route = createFileRoute("/_app/moderation")({ component: ForumModerationPage });

function ForumModerationPage() {
  return (
    <Container size="lg" py="xl">
      <Title className="page-title" mb="xs">
        Forum Moderation
      </Title>
      <Text c="dimmed" className="page-description" mb="xl">
        Review flagged content and manage user behavior.
      </Text>

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
                  <Button size="xs" variant="light" color="pink">
                    Review
                  </Button>
                  <ActionIcon variant="light" color="red" size="sm">
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
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
          />
          <Select
            label="Ban Duration"
            placeholder="Select duration"
            data={["1 Day", "3 Days", "7 Days", "14 Days", "30 Days"]}
          />
        </Group>
        <Group justify="flex-end" mt="md">
          <Button color="red" radius="xl">
            Issue Ban
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
