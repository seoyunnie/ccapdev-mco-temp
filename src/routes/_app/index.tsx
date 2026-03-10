import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  SimpleGrid,
  Box,
  ThemeIcon,
  List,
  rem,
  Badge,
  Stack,
} from "@mantine/core";
import { IconCheck, IconArrowRight, IconBook, IconMessageCircle, IconCompass } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import ctaPattern from "../../assets/backgrounds/cta-pattern.svg";
import heroBg from "../../assets/backgrounds/hero-bg.svg";
import statsTexture from "../../assets/backgrounds/stats-texture.svg";
import aboutIllustration from "../../assets/features/about-illustration.svg";
import step1Browse from "../../assets/features/step-1-browse.svg";
import step2Reserve from "../../assets/features/step-2-reserve.svg";
import step3Rate from "../../assets/features/step-3-rate.svg";
import studyNookHero from "../../assets/heroes/study-nook-hero.svg";
import { LinkButton } from "../../components/link-button.tsx";
import { FEATURES } from "../../data/features.ts";
import { STATS } from "../../data/stats.ts";
import { FadeInSection } from "../../hooks/use-fade-in.tsx";

import imgStyles from "../../components/shared-images.module.css";
import styles from "./index.module.css";

export const Route = createFileRoute("/_app/")({
  head: () => ({ meta: [{ title: "Adormable | Your Dormitory Companion" }] }),
  component: LandingPage,
});

const STEP_IMAGES = [step1Browse, step2Reserve, step3Rate];

function LandingPage() {
  return (
    <>
      <div
        className={styles.heroSection}
        style={{
          backgroundImage: `linear-gradient(160deg, rgba(255,240,246,0.85) 0%, rgba(250,250,250,0.85) 50%, rgba(243,229,245,0.85) 100%), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container size="lg">
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <Badge color="pink" variant="light" size="lg" radius="xl" mb="md">
                Dormitory Life, Reimagined
              </Badge>

              <Title className={styles.heroTitle}>
                Find Your Perfect <span className={styles.heroHighlight}>Study Spot</span> & Dorm Community
              </Title>

              <Text c="dimmed" mt="md" size="lg">
                Adormable is your all-in-one platform for study space reservations, community discussions, and local
                establishment reviews — built for dorm residents.
              </Text>

              <List
                mt={30}
                spacing="sm"
                size="sm"
                icon={
                  <ThemeIcon size={20} radius="xl" color="pink">
                    <IconCheck size={rem("12px")} stroke={1.5} />
                  </ThemeIcon>
                }
              >
                <List.Item>Interactive study space reservations with real-time availability</List.Item>
                <List.Item>Community forum to connect, discuss, and share with residents</List.Item>
                <List.Item>Comprehensive local directory with honest reviews & ratings</List.Item>
                <List.Item>Role-based access for residents, concierge, and administrators</List.Item>
              </List>

              <Group mt={30}>
                <LinkButton
                  radius="xl"
                  size="md"
                  color="pink"
                  className={styles.heroControlButton}
                  to="/login"
                  search={{ register: "true" }}
                >
                  Get Started
                </LinkButton>
                <Button
                  variant="default"
                  radius="xl"
                  size="md"
                  className={styles.heroControlButton}
                  component="a"
                  href="#features"
                >
                  Explore Features
                </Button>
              </Group>
            </div>

            <div className={styles.heroImageContainer}>
              <img src={studyNookHero} alt="Adormable — study space reservation" className={styles.heroIllustration} />
            </div>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt={60}>
            <Card
              className={styles.quickActionCard}
              component={Link}
              to="/study-nook"
              shadow="sm"
              radius="md"
              padding="lg"
            >
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={44} radius="md" variant="light" color="pink">
                  <IconBook size={22} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fw={600} size="sm">
                    Study Nook
                  </Text>
                  <Text c="dimmed" size="xs">
                    Reserve a study space
                  </Text>
                </Stack>
                <IconArrowRight size={16} color="var(--mantine-color-dimmed)" style={{ marginLeft: "auto" }} />
              </Group>
            </Card>

            <Card className={styles.quickActionCard} component={Link} to="/lobby" shadow="sm" radius="md" padding="lg">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={44} radius="md" variant="light" color="grape">
                  <IconMessageCircle size={22} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fw={600} size="sm">
                    Virtual Lobby
                  </Text>
                  <Text c="dimmed" size="xs">
                    Join discussions
                  </Text>
                </Stack>
                <IconArrowRight size={16} color="var(--mantine-color-dimmed)" style={{ marginLeft: "auto" }} />
              </Group>
            </Card>

            <Card className={styles.quickActionCard} component={Link} to="/guide" shadow="sm" radius="md" padding="lg">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={44} radius="md" variant="light" color="teal">
                  <IconCompass size={22} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fw={600} size="sm">
                    Survival Guide
                  </Text>
                  <Text c="dimmed" size="xs">
                    Explore nearby spots
                  </Text>
                </Stack>
                <IconArrowRight size={16} color="var(--mantine-color-dimmed)" style={{ marginLeft: "auto" }} />
              </Group>
            </Card>
          </SimpleGrid>
        </Container>
      </div>

      <Container size="lg" mt={-40} mb="xl" style={{ position: "relative", zIndex: 1 }}>
        <FadeInSection
          className={styles.statisticsBar}
          style={{ backgroundImage: `url(${statsTexture})`, backgroundSize: "cover", backgroundBlendMode: "overlay" }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.statisticItem}>
              <Text className={styles.statisticCount}>{stat.value}</Text>
              <Text className={styles.statisticTitle}>{stat.label}</Text>
              <Text className={styles.statisticDescription}>{stat.description}</Text>
            </div>
          ))}
        </FadeInSection>
      </Container>

      <Box py={80} style={{ backgroundColor: "#f8f9fa" }}>
        <FadeInSection>
          <Container size="lg">
            <Title className={styles.sectionTitle} ta="center">
              Everything You Need, In 3 Simple Steps
            </Title>
            <Text c="dimmed" className={styles.sectionDescription} ta="center" mt="md">
              Getting started with Adormable is as easy as 1-2-3.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mt={50}>
              {["Browse & Discover", "Reserve & Engage", "Rate & Connect"].map((title, i) => (
                <Card key={title} shadow="md" radius="md" className={styles.stepCard} padding="xl">
                  <img src={STEP_IMAGES[i]} alt={title} className={imgStyles.stepImage} />
                  <div className={styles.stepNumber} style={{ marginTop: "var(--mantine-spacing-md)" }}>
                    {i + 1}
                  </div>
                  <Text ta="center" fz="lg" fw={500} mt="sm">
                    {title}
                  </Text>
                  <Text ta="center" fz="sm" c="dimmed" mt="sm">
                    {i === 0
                      ? "Explore study zones, forum posts, or local establishments — all in one platform."
                      : // oxlint-disable-next-line unicorn/no-nested-ternary
                        i === 1
                        ? "Book your study spot, join conversations, or write reviews about your favorite stores."
                        : "Share your experiences, help fellow residents, and build your dorm community together!"}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Container>
        </FadeInSection>
      </Box>

      <Box py={80} style={{ backgroundColor: "#fff7fa" }} id="features">
        <FadeInSection>
          <Container size="lg">
            <Badge color="pink" variant="filled" size="lg" radius="xl" mx="auto" display="block" w="fit-content">
              Our Features
            </Badge>
            <Title className={styles.sectionTitle} ta="center" mt="sm">
              What Makes Adormable Special?
            </Title>
            <Text c="dimmed" className={styles.sectionDescription} ta="center" mt="md">
              Three core modules designed to make your dorm life easier.
            </Text>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
              {FEATURES.map((feature) => (
                <Card
                  key={feature.title}
                  shadow="md"
                  radius="md"
                  className={styles.featureCard}
                  padding="xl"
                  component={Link}
                  to={feature.to}
                >
                  <img src={feature.image} alt={feature.title} className={imgStyles.cardImageContained} />
                  <Group gap="xs" mt="md">
                    <feature.iconComponent
                      size={rem("24px")}
                      stroke={1.5}
                      color={`var(--mantine-color-${feature.color}-6)`}
                    />
                    <Text
                      fz="lg"
                      fw={500}
                      className={styles.featureCardTitle}
                      style={
                        // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
                        { "--feature-color": `var(--mantine-color-${feature.color}-filled)` } as React.CSSProperties
                      }
                    >
                      {feature.title}
                    </Text>
                  </Group>
                  <Text fz="sm" c="dimmed" mt="sm">
                    {feature.description}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Container>
        </FadeInSection>
      </Box>

      <Container size="lg" py={80}>
        <FadeInSection className={styles.aboutContainer}>
          <div className={styles.aboutImagePlaceholder}>
            <img src={aboutIllustration} alt="About Adormable" className={imgStyles.aboutImage} />
          </div>

          <div className={styles.aboutContent}>
            <Badge color="pink" variant="light" size="lg" radius="xl" mb="md">
              About Us
            </Badge>
            <Title className={styles.sectionTitle}>Comfort Is Our Top Priority</Title>
            <Text c="dimmed" mt="md">
              Adormable is built for dormitory residents who want a seamless way to manage daily life — from reserving
              study spaces to finding the best food spots nearby.
            </Text>

            <List
              mt={30}
              spacing="sm"
              size="sm"
              icon={
                <ThemeIcon size={20} radius="xl" color="pink">
                  <IconCheck size={rem("12px")} stroke={1.5} />
                </ThemeIcon>
              }
            >
              <List.Item>Interactive study space reservations with real-time availability</List.Item>
              <List.Item>Community forum to connect, discuss, and share with residents</List.Item>
              <List.Item>Comprehensive local directory with honest reviews & ratings</List.Item>
            </List>

            <LinkButton
              color="pink"
              radius="xl"
              size="md"
              mt={30}
              to="/login"
              search={{ register: "true" }}
              rightSection={<IconArrowRight size={16} />}
            >
              Join Adormable
            </LinkButton>
          </div>
        </FadeInSection>
      </Container>

      <Container size="lg" pb={80}>
        <FadeInSection
          className={styles.callToActionBanner}
          style={{ backgroundImage: `url(${ctaPattern})`, backgroundSize: "cover", backgroundBlendMode: "soft-light" }}
        >
          <Title order={2} c="black" mb="md">
            Ready to Make Dorm Life Better?
          </Title>
          <Text c="black" maw={500} mx="auto" mb="xl" style={{ opacity: 0.9 }}>
            Join hundreds of residents already using Adormable to reserve study spots, connect with neighbors, and
            discover local gems.
          </Text>
          <Group justify="center">
            <LinkButton size="lg" variant="white" color="pink" radius="xl" to="/login" search={{ register: "true" }}>
              Join Now
            </LinkButton>
            <LinkButton size="lg" variant="outline" radius="xl" color="black" to="/guide">
              Browse Directory
            </LinkButton>
          </Group>
        </FadeInSection>
      </Container>
    </>
  );
}
