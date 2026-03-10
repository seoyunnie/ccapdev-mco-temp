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
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import catCoffeeShop from "../../../assets/establishments/cat-coffee-shop.svg";
import catConvenienceStore from "../../../assets/establishments/cat-convenience-store.svg";
import catFilipinoFood from "../../../assets/establishments/cat-filipino-food.svg";
import catKoreanBbq from "../../../assets/establishments/cat-korean-bbq.svg";
import catServices from "../../../assets/establishments/cat-services.svg";
import emptyState from "../../../assets/features/empty-state.svg";
import { BackButton } from "../../../components/back-button.tsx";
import { EmptyState } from "../../../components/empty-state.tsx";
import { getEstablishment, createReview, createOwnerReply, toggleHelpful } from "../../../server/establishments.ts";

import imgStyles from "../../../components/shared-images.module.css";

const CATEGORY_ICONS: Record<string, string> = {
  "Coffee Shop": catCoffeeShop,
  "Filipino Food": catFilipinoFood,
  Services: catServices,
  "Korean BBQ": catKoreanBbq,
  "Convenience Store": catConvenienceStore,
};

export const Route = createFileRoute("/_app/guide/$estId")({
  loader: ({ params }) => getEstablishment({ data: { estId: params.estId } }),
  head: () => ({ meta: [{ title: "Establishment | Adormable" }] }),
  errorComponent: () => (
    <Container size="md" py="xl">
      <BackButton to="/guide" label="Back to Directory" color="teal" />
      <EmptyState image={emptyState} message="Establishment not found." />
    </Container>
  ),
  component: EstablishmentDetailsPage,
});

function EstablishmentDetailsPage() {
  const data = Route.useLoaderData();
  const { estId } = Route.useParams();
  const router = useRouter();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const categoryIcon = CATEGORY_ICONS[data.category];

  const handleToggleHelpful = async (reviewId: string) => {
    await toggleHelpful({ data: { reviewId } });
    void router.invalidate();
  };

  return (
    <Container size="md" py="xl">
      <BackButton to="/guide" label="Back to Directory" color="teal" />

      <Paper shadow="md" p="lg" radius="md" className="content-card" mb="lg">
        <img src={categoryIcon ?? catServices} alt={data.name} className={imgStyles.cardImageTall} />
        <Group justify="space-between" wrap="wrap">
          <Stack gap="xs">
            <Group>
              <Title order={2}>{data.name}</Title>
              <Badge
                variant="light"
                size="lg"
                leftSection={categoryIcon ? <img src={categoryIcon} alt="" width={16} height={16} /> : undefined}
              >
                {data.category}
              </Badge>
            </Group>
            <Text c="dimmed">{data.description}</Text>
          </Stack>
          <Stack align="center" gap={4}>
            <Text size="xl" fw={700}>
              {data.rating}
            </Text>
            <Rating value={data.rating} fractions={2} readOnly />
            <Text size="sm" c="dimmed">
              {data.totalReviews} reviews
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
          <Textarea
            placeholder="Share your experience..."
            minRows={4}
            value={reviewContent}
            onChange={(e) => {
              setReviewContent(e.currentTarget.value);
            }}
          />
          <Group>
            <FileInput
              placeholder="Upload images"
              leftSection={<IconPhoto size={16} />}
              accept="image/*"
              multiple
              value={reviewImages}
              onChange={setReviewImages}
            />
            <Button
              color="pink"
              radius="xl"
              onClick={async () => {
                if (!reviewRating || !reviewContent.trim()) {
                  return;
                }
                // Convert images to base64
                const imagePromises = reviewImages.map(
                  (file) =>
                    // oxlint-disable-next-line promise/avoid-new
                    new Promise<string>((resolve, reject) => {
                      const reader = new FileReader();
                      reader.addEventListener("load", () => {
                        const { result } = reader;
                        if (typeof result !== "string") {
                          reject(new Error("Unexpected FileReader result type"));
                          return;
                        }
                        resolve(result);
                      });
                      reader.addEventListener("error", () => reject(reader.error ?? new Error("FileReader error")));
                      reader.readAsDataURL(file);
                    }),
                );
                const images = reviewImages.length > 0 ? await Promise.all(imagePromises) : undefined;
                await createReview({
                  data: { establishmentId: estId, rating: reviewRating, content: reviewContent, images },
                });
                setReviewRating(0);
                setReviewContent("");
                setReviewImages([]);
                void router.invalidate();
              }}
            >
              Submit Review
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Title order={4} mb="md">
        Reviews ({data.reviews.length})
      </Title>
      <Stack>
        {data.reviews.map((review: (typeof data.reviews)[number]) => (
            <Paper key={review.id} withBorder p="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Group>
                  <Avatar color="pink" radius="xl">
                    {review.author
                      .split(" ")
                      .map((n: string) => n[0])
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
              {review.images.length > 0 && (
                <Group gap="xs" mb="sm">
                  {review.images.map((img: string, i: number) => (
                    <img
                      key={img}
                      src={img}
                      alt={`Review ${i + 1}`}
                      style={{ maxWidth: 120, maxHeight: 90, borderRadius: 8, objectFit: "cover" }}
                    />
                  ))}
                </Group>
              )}
              <Group>
                <ActionIcon
                  variant={review.isHelpful ? "filled" : "subtle"}
                  color="pink"
                  size="sm"
                  onClick={() => {
                    void handleToggleHelpful(review.id);
                  }}
                >
                  <IconThumbUp size={14} />
                </ActionIcon>
                <Text size="xs" c="dimmed">
                  {review.helpful} found helpful
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
                        {data.ownerName}
                      </Text>
                    </Group>
                    <Text size="sm">{review.ownerReply}</Text>
                  </Paper>
                </>
              )}
              {review.ownerReply === null && data.isOwner && (
                <Group mt="xs" gap="xs">
                  <Textarea
                    placeholder="Reply as owner..."
                    size="xs"
                    style={{ flex: 1 }}
                    value={replyText[review.id] ?? ""}
                    onChange={(e) => {
                      setReplyText((prev) => ({ ...prev, [review.id]: e.currentTarget.value }));
                    }}
                  />
                  <Button
                    size="xs"
                    variant="light"
                    color="pink"
                    onClick={async () => {
                      const text = replyText[review.id]?.trim();
                      if (!text) {
                        return;
                      }
                      await createOwnerReply({ data: { reviewId: review.id, reply: text } });
                      setReplyText((prev) => ({ ...prev, [review.id]: "" }));
                      void router.invalidate();
                    }}
                  >
                    Reply
                  </Button>
                </Group>
              )}
            </Paper>
          ))}
      </Stack>
    </Container>
  );
}
