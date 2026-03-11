import { ActionIcon, Group, Text } from "@mantine/core";
import useEmblaCarousel from "embla-carousel-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { IconChevronLeft, IconChevronRight } from "../lib/icons.tsx";

import styles from "./card-carousel.module.css";

interface CardCarouselProps {
  readonly children: ReactNode;
  readonly label?: string;
  readonly hint?: string;
}

export function CardCarousel({ children, label = "", hint = "" }: CardCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", dragFree: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollSnaps = emblaApi?.scrollSnapList() ?? [];

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const totalSlides = scrollSnaps.length;
  const controlsDisabled = totalSlides <= 1;

  return (
    <div className={styles.carouselShell} aria-label={label}>
      <div className={styles.carouselViewport}>
        <div className={styles.carouselEdge} aria-hidden="true" />
        <div className={styles.carousel} ref={emblaRef}>
          <div className={styles.carouselContainer}>{children}</div>
        </div>
        <div className={`${styles.carouselEdge} ${styles.carouselEdgeRight}`} aria-hidden="true" />
      </div>
      <Group justify="space-between" align="center" mt="md" gap="sm">
        <div>
          <Text size="xs" fw={700} tt="uppercase" className={styles.carouselLabel}>
            {label}
          </Text>
          <Text size="sm" c="dimmed" className={styles.carouselHint}>
            {hint}
          </Text>
        </div>
        <Group gap="sm" wrap="nowrap">
          <Text size="sm" className={styles.carouselStatus}>
            {totalSlides === 0 ? "0 / 0" : `${selectedIndex + 1} / ${totalSlides}`}
          </Text>
          <div className={styles.carouselDots}>
            {scrollSnaps.map((snap, idx) => (
              <button
                key={String(snap)}
                type="button"
                className={`${styles.carouselDot} ${idx === selectedIndex ? styles.carouselDotActive : ""}`}
                onClick={() => emblaApi?.scrollTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <div className={styles.carouselControls}>
            <ActionIcon
              variant="light"
              color="pink"
              size="lg"
              radius="xl"
              onClick={scrollPrev}
              aria-label="Previous"
              disabled={controlsDisabled}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="pink"
              size="lg"
              radius="xl"
              onClick={scrollNext}
              aria-label="Next"
              disabled={controlsDisabled}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </div>
        </Group>
      </Group>
    </div>
  );
}

export function CarouselSlide({ children }: { readonly children: ReactNode }) {
  return <div className={styles.carouselSlide}>{children}</div>;
}
