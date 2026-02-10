import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  SimpleGrid,
  Stack,
  Box,
  ThemeIcon,
  List,
  rem,
  Badge,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { IconBook, IconMessageCircle, IconCompass, IconCheck, IconArrowRight } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AppLink } from "../../components/app-link.tsx";
import classes from "../../styles/landing.module.css";

const features = [
  {
    icon: IconBook,
    title: "The Study Nook",
    description:
      "Reserve study spaces in seconds. Interactive seat maps, 30-minute intervals, and anonymous booking options.",
    color: "pink",
    to: "/study-nook",
  },
  {
    icon: IconMessageCircle,
    title: "The Virtual Lobby",
    description:
      "Connect with fellow residents. Post discussions, upvote content, and engage in threaded conversations.",
    color: "grape",
    to: "/lobby",
  },
  {
    icon: IconCompass,
    title: "The Survival Guide",
    description: "Discover local spots. Browse reviews, star ratings, and recommendations from fellow residents.",
    color: "teal",
    to: "/guide",
  },
];

const stats = [
  { value: "500+", label: "Happy Residents", description: "Active users across all dormitory buildings" },
  { value: "50+", label: "Study Spots", description: "Reservable spaces with real-time availability" },
  { value: "200+", label: "Reviews", description: "Honest community ratings of local establishments" },
];

const carouselSlides = [
  {
    title: "Study Nook",
    description: "Book your ideal study spot with our interactive reservation system.",
    bg: "linear-gradient(135deg, #fff0f6, #fcc2d7)",
  },
  {
    title: "Virtual Lobby",
    description: "Stay connected with the dormitory community through discussions and posts.",
    bg: "linear-gradient(135deg, #f3f0ff, #d0bfff)",
  },
  {
    title: "Survival Guide",
    description: "Find the best local establishments near your dormitory.",
    bg: "linear-gradient(135deg, #e6fcf5, #96f2d7)",
  },
];

const bulletPoints = [
  "Interactive study space reservations with real-time availability",
  "Community forum to connect, discuss, and share with residents",
  "Comprehensive local directory with honest reviews & ratings",
  "Role-based access for residents, concierge, and administrators",
];

export const Route = createFileRoute("/_app/")({ component: LandingPage });

function LandingPage() {
  return (
    <>
      <div className={classes.heroSection}>
        <Container size="lg">
          <div className={classes.heroInner}>
            <div className={classes.heroContent}>
              <Badge color="pink" variant="light" size="lg" radius="xl" mb="md">
                Dormitory Life, Reimagined
              </Badge>

              <Title className={classes.heroTitle}>
                Find Your Perfect <span className={classes.heroHighlight}>Study Spot</span> & Dorm Community
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
                    <IconCheck size={rem(12)} stroke={1.5} />
                  </ThemeIcon>
                }
              >
                {bulletPoints.map((point) => (
                  <List.Item key={point}>{point}</List.Item>
                ))}
              </List>

              <Group mt={30}>
                <Button
                  radius="xl"
                  size="md"
                  color="pink"
                  className={classes.heroControl}
                  component={AppLink}
                  to="/login"
                  search={{ register: "true" }}
                >
                  Get Started
                </Button>
                <Button
                  variant="default"
                  radius="xl"
                  size="md"
                  className={classes.heroControl}
                  component="a"
                  href="#features"
                >
                  Explore Features
                </Button>
              </Group>
            </div>

            <div className={classes.heroImage}>
              <Carousel withIndicators height={340} slideGap="md">
                {carouselSlides.map((slide) => (
                  <Carousel.Slide key={slide.title}>
                    <Card h="100%" p="xl" radius="md" style={{ background: slide.bg }}>
                      <Stack justify="center" h="100%" gap="md">
                        <Title order={2}>{slide.title}</Title>
                        <Text c="dimmed" size="md">
                          {slide.description}
                        </Text>
                        <Button
                          variant="white"
                          color="dark"
                          radius="xl"
                          rightSection={<IconArrowRight size={16} />}
                          style={{ width: "fit-content" }}
                        >
                          Learn More
                        </Button>
                      </Stack>
                    </Card>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </div>
        </Container>
      </div>

      <Container size="lg" mt={-40} mb="xl" style={{ position: "relative", zIndex: 1 }}>
        <div className={classes.statsRoot}>
          {stats.map((stat) => (
            <div key={stat.label} className={classes.statItem}>
              <Text className={classes.statCount}>{stat.value}</Text>
              <Text className={classes.statTitle}>{stat.label}</Text>
              <Text className={classes.statDescription}>{stat.description}</Text>
            </div>
          ))}
        </div>
      </Container>

      <Container size="lg" py={80}>
        <Title className={classes.sectionTitle} ta="center">
          Everything You Need, In 3 Simple Steps
        </Title>
        <Text c="dimmed" className={classes.sectionDescription} ta="center" mt="md">
          Getting started with Adormable is as easy as 1-2-3.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mt={50}>
          {["Browse & Discover", "Reserve & Engage", "Rate & Connect"].map((title, i) => (
            <Card key={title} shadow="md" radius="md" className={classes.stepCard} padding="xl">
              <div className={classes.stepNumber}>{i + 1}</div>
              <Text ta="center" fz="lg" fw={500} mt="sm">
                {title}
              </Text>
              <Text ta="center" fz="sm" c="dimmed" mt="sm">
                {i === 0
                  ? "Explore study zones, forum posts, or local establishments — all in one platform."
                  : i === 1
                    ? "Book your study spot, join conversations, or write reviews about your favorite stores."
                    : "Share your experiences, help fellow residents, and build your dorm community together!"}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      <Box py={80} style={{ backgroundColor: "#fff7fa" }} id="features">
        <Container size="lg">
          <Badge color="pink" variant="filled" size="lg" radius="xl" mx="auto" display="block" w="fit-content">
            Our Features
          </Badge>
          <Title className={classes.sectionTitle} ta="center" mt="sm">
            What Makes Adormable Special?
          </Title>
          <Text c="dimmed" className={classes.sectionDescription} ta="center" mt="md">
            Three core modules designed to make your dorm life easier.
          </Text>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
            {features.map((feature) => (
              <Card
                key={feature.title}
                shadow="md"
                radius="md"
                className={classes.featureCard}
                padding="xl"
                component={AppLink}
                to={feature.to}
              >
                <feature.icon size={rem(50)} stroke={1.5} color={`var(--mantine-color-${feature.color}-6)`} />
                <Text fz="lg" fw={500} className={classes.featureCardTitle} mt="md">
                  {feature.title}
                </Text>
                <Text fz="sm" c="dimmed" mt="sm">
                  {feature.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Container size="lg" py={80}>
        <div className={classes.aboutInner}>
          <div className={classes.aboutImage}>
            <Text size="4rem" fw={900} c="pink" style={{ opacity: 0.3 }}>
              A.
            </Text>
          </div>

          <div className={classes.aboutContent}>
            <Badge color="pink" variant="light" size="lg" radius="xl" mb="md">
              About Us
            </Badge>
            <Title className={classes.sectionTitle}>Comfort Is Our Top Priority</Title>
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
                  <IconCheck size={rem(12)} stroke={1.5} />
                </ThemeIcon>
              }
            >
              <List.Item>Interactive study space reservations with real-time availability</List.Item>
              <List.Item>Community forum to connect, discuss, and share with residents</List.Item>
              <List.Item>Comprehensive local directory with honest reviews & ratings</List.Item>
            </List>

            <Button
              color="pink"
              radius="xl"
              size="md"
              mt={30}
              component={AppLink}
              to="/login"
              search={{ register: "true" }}
              rightSection={<IconArrowRight size={16} />}
            >
              Join Adormable
            </Button>
          </div>
        </div>
      </Container>

      <Container size="lg" pb={80}>
        <div className={classes.ctaBanner}>
          <Title order={2} c="white" mb="md">
            Ready to Make Dorm Life Better?
          </Title>
          <Text c="white" maw={500} mx="auto" mb="xl" style={{ opacity: 0.9 }}>
            Join hundreds of residents already using Adormable to reserve study spots, connect with neighbors, and
            discover local gems.
          </Text>
          <Group justify="center">
            <Link to="/login" search={{ register: "true" }}>
              <Button size="lg" variant="white" color="pink" radius="xl">
                Join Now
              </Button>
            </Link>
            <Link to="/guide">
              <Button size="lg" variant="outline" radius="xl" style={{ borderColor: "white", color: "white" }}>
                Browse Directory
              </Button>
            </Link>
          </Group>
        </div>
      </Container>
    </>
  );
}
