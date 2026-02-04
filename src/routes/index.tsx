import { Center, Container, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

function LandingPage() {
  return (
    <Container h="100vh">
      <Center h="100%">
        <Title>Hello World!</Title>
      </Center>
    </Container>
  );
}

export const Route = createFileRoute("/")({ component: LandingPage });
