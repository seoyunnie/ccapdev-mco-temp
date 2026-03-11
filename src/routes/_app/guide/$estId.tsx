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
  Badge,
  Divider,
  ActionIcon,
  FileInput,
} from "@mantine/core";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import emptyState from "../../../assets/features/empty-state.svg";
import { BackButton } from "../../../components/back-button.tsx";
import { EmptyState } from "../../../components/empty-state.tsx";
import { DetailSkeleton } from "../../../components/page-skeleton.tsx";
import { UserAvatar } from "../../../components/user-avatar.tsx";
import { FALLBACK_GUIDE_CATEGORY_ICON, GUIDE_CATEGORY_ICONS } from "../../../features/guide/guide.constants.ts";
import { IconPhoto, IconThumbUp } from "../../../lib/icons.tsx";
import { getEstablishment, createReview, createOwnerReply, toggleHelpful } from "../../../server/establishments.ts";

import imgStyles from "../../../components/shared-images.module.css";
import styles from "./$estId.module.css";

export const Route = createFileRoute("/_app/guide/$estId")({
  loader: ({ params }) => getEstablishment({ data: { estId: params.estId } }),
  head: () => ({ meta: [{ title: "Establishment | Adormable" }] }),
  pendingComponent: DetailSkeleton,
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

  const categoryIcon = GUIDE_CATEGORY_ICONS[data.category];

  const handleToggleHelpful = async (reviewId: string) => {
    await toggleHelpful({ data: { reviewId } });
    void router.invalidate();
  };

  return (
    <Container size="md" py="xl" className="pageEnter">
      <BackButton to="/guide" label="Back to Directory" color="teal" />

      <Paper shadow="md" p="lg" radius="md" className={`content-card ${styles.heroCard}`} mb="lg">
        <div className={styles.heroMedia}>
          <img
            src={data.image ?? categoryIcon ?? FALLBACK_GUIDE_CATEGORY_ICON}
            alt={data.name}
            className={imgStyles.cardImageTall}
          />
        </div>
        <Group justify="space-between" wrap="wrap">
          <Stack gap="xs">
            <Group className={styles.heroMeta}>
              <Title order={2}>{data.name}</Title>
              <Badge
                className={styles.heroBadge}
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

      <Paper shadow="md" p="lg" radius="md" className={`content-card ${styles.reviewComposer}`} mb="lg">
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

      <Title order={4} mb="md" className={styles.reviewsTitle}>
        Reviews ({data.reviews.length})
      </Title>
      <Stack>
        {data.reviews.map((review: (typeof data.reviews)[number]) => (
          <Paper key={review.id} withBorder p="md" radius="md" className={styles.reviewCard}>
            <Group justify="space-between" mb="sm">
              <Group>
                <UserAvatar name={review.author} image={review.authorImage} color="pink" radius="xl" />
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
              <div className={styles.reviewGallery}>
                {review.images.map((img: string, i: number) => (
                  <img key={img} src={img} alt={`Review ${i + 1}`} className={styles.reviewImage} />
                ))}
              </div>
            )}
            <Group>
              <ActionIcon
                variant={review.isHelpful ? "filled" : "subtle"}
                color="pink"
                size="sm"
                aria-label={review.isHelpful ? "Remove helpful vote" : "Mark review as helpful"}
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
