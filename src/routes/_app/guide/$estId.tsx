import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Rating,
  Button,
  Textarea,
  Avatar,
  Badge,
  Divider,
  ActionIcon,
  FileInput,
} from "@mantine/core";
import { IconThumbUp, IconPhoto } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import classes from "../../../styles/shared.module.css";

const establishment = {
  name: "Café Manila",
  category: "Coffee Shop",
  rating: 4.5,
  totalReviews: 32,
  description:
    "Cozy café with great drip coffee and pastries. Perfect for late-night study sessions. Open from 7 AM to 11 PM daily.",
};

const reviews = [
  {
    id: "r1",
    author: "Maria Santos",
    rating: 5,
    time: "3 days ago",
    content: "Best coffee near the dorm! Their iced latte is amazing and the WiFi is fast. Perfect for studying.",
    helpful: 12,
    ownerReply: "Thank you Maria! Glad you enjoy studying here!",
  },
  {
    id: "r2",
    author: "Juan Reyes",
    rating: 4,
    time: "1 week ago",
    content: "Good food, decent prices. Can get a bit crowded during lunch. The staff is super friendly though!",
    helpful: 7,
    ownerReply: null,
  },
  {
    id: "r3",
    author: "Ava Cruz",
    rating: 4,
    time: "2 weeks ago",
    content:
      "Their pastries are freshly baked every day. I love the ensaymada and the Spanish bread. A bit pricey but worth it.",
    helpful: 4,
    ownerReply: "Thanks for the kind words Ava! We bake everything fresh daily!",
  },
];

export const Route = createFileRoute("/_app/guide/$estId")({ component: EstablishmentDetailsPage });

function EstablishmentDetailsPage() {
  return (
    <Container size="md" py="xl">
      <Link to="/guide">
        <Button variant="subtle" color="pink" mb="md" size="sm">
          ← Back to Directory
        </Button>
      </Link>

      <Paper shadow="md" p="lg" radius="md" className={classes.card} mb="lg">
        <Group justify="space-between" wrap="wrap">
          <Stack gap="xs">
            <Group>
              <Title order={2}>{establishment.name}</Title>
              <Badge variant="light" size="lg">
                {establishment.category}
              </Badge>
            </Group>
            <Text c="dimmed">{establishment.description}</Text>
          </Stack>
          <Stack align="center" gap={4}>
            <Text size="xl" fw={700}>
              {establishment.rating}
            </Text>
            <Rating value={establishment.rating} fractions={2} readOnly />
            <Text size="sm" c="dimmed">
              {establishment.totalReviews} reviews
            </Text>
          </Stack>
        </Group>
      </Paper>

      <Paper shadow="md" p="lg" radius="md" className={classes.card} mb="lg">
        <Title order={4} mb="md">
          Write a Review
        </Title>
        <Stack>
          <Group>
            <Text size="sm">Your Rating:</Text>
            <Rating size="lg" />
          </Group>
          <Textarea placeholder="Share your experience..." minRows={4} />
          <Group>
            <FileInput placeholder="Upload images" leftSection={<IconPhoto size={16} />} accept="image/*" multiple />
            <Button color="pink" radius="xl">
              Submit Review
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Title order={4} mb="md">
        Reviews ({reviews.length})
      </Title>
      <Stack>
        {reviews.map((review) => (
          <Paper key={review.id} withBorder p="md" radius="md">
            <Group justify="space-between" mb="sm">
              <Group>
                <Avatar color="pink" radius="xl">
                  {review.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>
                <Stack gap={2}>
                  <Text fw={600}>{review.author}</Text>
                  <Text size="xs" c="dimmed">
                    {review.time}
                  </Text>
                </Stack>
              </Group>
              <Rating value={review.rating} readOnly size="sm" />
            </Group>
            <Text size="sm" mb="sm">
              {review.content}
            </Text>
            <Group>
              <ActionIcon variant="subtle" color="pink" size="sm">
                <IconThumbUp size={14} />
              </ActionIcon>
              <Text size="xs" c="dimmed">
                {review.helpful} found helpful
              </Text>
            </Group>
            {review.ownerReply && (
              <>
                <Divider my="sm" />
                <Paper bg="pink.0" p="sm" radius="sm">
                  <Group gap="xs" mb={4}>
                    <Badge size="xs" color="pink">
                      Owner
                    </Badge>
                    <Text size="xs" c="dimmed">
                      Café Manila
                    </Text>
                  </Group>
                  <Text size="sm">{review.ownerReply}</Text>
                </Paper>
              </>
            )}
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
