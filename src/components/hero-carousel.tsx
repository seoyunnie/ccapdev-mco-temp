import { Carousel } from "@mantine/carousel";
import { Button, Card, Stack, Title, Text } from "@mantine/core";
import { IconArrowRight, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import type { CarouselFeature } from "../data/features.ts";

import styles from "./hero-carousel.module.css";
import imgStyles from "./shared-images.module.css";

interface HeroCarouselProps {
  readonly features: readonly CarouselFeature[];
}

export function HeroCarousel({ features }: HeroCarouselProps) {
  return (
    <Carousel
      height={380}
      withIndicators
      withControls
      emblaOptions={{ loop: true }}
      classNames={{ indicator: styles.indicator, control: styles.control }}
      nextControlIcon={<IconChevronRight size={18} />}
      previousControlIcon={<IconChevronLeft size={18} />}
    >
      {features.map((slide) => (
        <Carousel.Slide key={slide.title}>
          <Card h="100%" p="xl" radius="lg" style={{ background: slide.background }}>
            <Stack justify="center" align="center" h="100%" gap="sm">
              <img src={slide.image} alt={slide.title} className={imgStyles.carouselImage} />
              <Title order={3} ta="center">
                {slide.title}
              </Title>
              <Text c="dimmed" size="sm" ta="center" maw={280}>
                {slide.description}
              </Text>
              <Button
                variant="white"
                color={slide.color}
                radius="xl"
                rightSection={<IconArrowRight size={16} />}
                component={Link}
                to={slide.to}
                style={{ width: "fit-content" }}
              >
                Learn More
              </Button>
            </Stack>
          </Card>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
