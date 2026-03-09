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
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import cafeManila from "../../../assets/establishments/1-cafe-manila.svg";
import kuyasCarinderia from "../../../assets/establishments/2-kuyas-carinderia.svg";
import quickPrints from "../../../assets/establishments/3-quick-prints.svg";
import samgyupCorner from "../../../assets/establishments/4-samgyup-corner.svg";
import laundryExpress from "../../../assets/establishments/5-laundry-express.svg";
import sevenElevenTaft from "../../../assets/establishments/6-7-eleven-taft.svg";
import catCoffeeShop from "../../../assets/establishments/cat-coffee-shop.svg";
import catConvenienceStore from "../../../assets/establishments/cat-convenience-store.svg";
import catFilipinoFood from "../../../assets/establishments/cat-filipino-food.svg";
import catKoreanBbq from "../../../assets/establishments/cat-korean-bbq.svg";
import catServices from "../../../assets/establishments/cat-services.svg";
import emptyState from "../../../assets/features/empty-state.svg";
import { BackButton } from "../../../components/back-button.tsx";
import { EmptyState } from "../../../components/empty-state.tsx";

import imgStyles from "../../../components/shared-images.module.css";

const CATEGORY_ICONS: Record<string, string> = {
  "Coffee Shop": catCoffeeShop,
  "Filipino Food": catFilipinoFood,
  Services: catServices,
  "Korean BBQ": catKoreanBbq,
  "Convenience Store": catConvenienceStore,
};

const establishments = [
  {
    id: "1",
    name: "Café Manila",
    category: "Coffee Shop",
    rating: 4.5,
    totalReviews: 32,
    description:
      "Cozy café with great drip coffee and pastries. Perfect for late-night study sessions. Open from 7 AM to 11 PM daily.",
    image: cafeManila,
  },
  {
    id: "2",
    name: "Kuya's Carinderia",
    category: "Filipino Food",
    rating: 4.2,
    totalReviews: 48,
    description:
      "Affordable and authentic Filipino dishes, just 2 minutes away from the dorm. A staple for homesick residents.",
    image: kuyasCarinderia,
  },
  {
    id: "3",
    name: "Quick Prints",
    category: "Services",
    rating: 3.8,
    totalReviews: 15,
    description: "Fast printing and photocopy services, open late. Great for last-minute project submissions.",
    image: quickPrints,
  },
  {
    id: "4",
    name: "Samgyup Corner",
    category: "Korean BBQ",
    rating: 4.7,
    totalReviews: 61,
    description: "Unlimited samgyeopsal near the dorm. Student-friendly prices and a fun group dining experience.",
    image: samgyupCorner,
  },
  {
    id: "5",
    name: "Laundry Express",
    category: "Services",
    rating: 3.5,
    totalReviews: 22,
    description: "Drop-off laundry service with same-day pickup available. Convenient for busy students.",
    image: laundryExpress,
  },
  {
    id: "6",
    name: "7-Eleven Taft",
    category: "Convenience Store",
    rating: 3.9,
    totalReviews: 10,
    description: "24/7 convenience store right next to the dorm entrance. Open all day, every day.",
    image: sevenElevenTaft,
  },
];

const reviewsMap: Record<string, typeof defaultReviews> = {
  "1": [
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
  ],
};

const defaultReviews = [
  {
    id: "r1",
    author: "Resident",
    rating: 4,
    time: "1 week ago",
    content: "Great place! Would recommend to other dorm residents.",
    helpful: 3,
    ownerReply: null as string | null,
  },
];

export const Route = createFileRoute("/_app/guide/$estId")({ component: EstablishmentDetailsPage });

function EstablishmentDetailsPage() {
  const { estId } = Route.useParams();
  const establishment = establishments.find((e) => e.id === estId);
  const reviews = reviewsMap[estId] ?? defaultReviews;

  const [reviewRating, setReviewRating] = useState(0);
  const [helpfulSet, setHelpfulSet] = useState<Set<string>>(new Set());

  if (!establishment) {
    return (
      <Container size="md" py="xl">
        <BackButton to="/guide" label="Back to Directory" color="teal" />
        <EmptyState image={emptyState} message="Establishment not found." />
      </Container>
    );
  }

  const categoryIcon = CATEGORY_ICONS[establishment.category];

  const toggleHelpful = (reviewId: string) => {
    setHelpfulSet((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  return (
    <Container size="md" py="xl">
      <BackButton to="/guide" label="Back to Directory" color="teal" />

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="lg">
        <img src={establishment.image} alt={establishment.name} className={imgStyles.cardImageTall} />
        <Group justify="space-between" wrap="wrap">
          <Stack gap="xs">
            <Group>
              <Title order={2}>{establishment.name}</Title>
              <Badge
                variant="light"
                size="lg"
                leftSection={categoryIcon ? <img src={categoryIcon} alt="" width={16} height={16} /> : undefined}
              >
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

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="lg">
        <Title order={4} mb="md">
          Write a Review
        </Title>
        <Stack>
          <Group>
            <Text size="sm">Your Rating:</Text>
            <Rating size="lg" value={reviewRating} onChange={setReviewRating} />
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
        {reviews.map((review) => {
          const isHelpful = helpfulSet.has(review.id);
          return (
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
                <ActionIcon
                  variant={isHelpful ? "filled" : "subtle"}
                  color="pink"
                  size="sm"
                  onClick={() => {
                    toggleHelpful(review.id);
                  }}
                >
                  <IconThumbUp size={14} />
                </ActionIcon>
                <Text size="xs" c="dimmed">
                  {review.helpful + (isHelpful ? 1 : 0)} found helpful
                </Text>
              </Group>
              {review.ownerReply !== null && (
                <>
                  <Divider my="sm" />
                  <Paper bg="pink.0" p="sm" radius="sm">
                    <Group gap="xs" mb={4}>
                      <Badge size="xs" color="pink">
                        Owner
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {establishment.name}
                      </Text>
                    </Group>
                    <Text size="sm">{review.ownerReply}</Text>
                  </Paper>
                </>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
}
