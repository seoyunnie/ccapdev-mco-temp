import { Container, Title, Text, Paper, Stack, List, Divider, Button } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";

import { SectionHeader } from "../../components/section-header.tsx";

export const Route = createFileRoute("/_app/terms")({
  head: () => ({ meta: [{ title: "Terms of Service | Adormable" }] }),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <Container size="md" py="xl">
      <SectionHeader title="Terms of Service" description="Last updated: March 1, 2026" />

      <Paper shadow="md" p="xl" radius="md" className="content-card">
        <Stack gap="lg">
          <section>
            <Title order={4} mb="xs">
              1. Acceptance of Terms
            </Title>
            <Text size="sm" c="dimmed">
              By accessing or using the Adormable dormitory management platform, you agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use the platform.
            </Text>
          </section>

          <Divider />

          <section>
            <Title order={4} mb="xs">
              2. User Accounts
            </Title>
            <Text size="sm" c="dimmed" mb="xs">
              When creating an account, you agree to:
            </Text>
            <List size="sm" c="dimmed">
              <List.Item>Provide accurate and complete registration information</List.Item>
              <List.Item>Maintain the security of your account credentials</List.Item>
              <List.Item>Notify administrators immediately of any unauthorized access</List.Item>
              <List.Item>Accept responsibility for all activity under your account</List.Item>
            </List>
          </section>

          <Divider />

          <section>
            <Title order={4} mb="xs">
              3. Acceptable Use
            </Title>
            <Text size="sm" c="dimmed" mb="xs">
              Users of the Adormable platform must not:
            </Text>
            <List size="sm" c="dimmed">
              <List.Item>Post content that is harassing, threatening, or discriminatory</List.Item>
              <List.Item>Share false or misleading information in reviews or forum posts</List.Item>
              <List.Item>Attempt to manipulate reservation systems or exploit platform features</List.Item>
              <List.Item>Impersonate other residents or staff members</List.Item>
              <List.Item>Use the platform for commercial purposes without authorization</List.Item>
            </List>
          </section>

          <Divider />

          <section>
            <Title order={4} mb="xs">
              4. Study Nook Reservations
            </Title>
            <Text size="sm" c="dimmed">
              Reservations are subject to availability and dormitory policies. No-shows may result in temporary
              suspension of booking privileges. The administration reserves the right to cancel or modify reservations
              for maintenance or emergency purposes.
            </Text>
          </section>

          <Divider />

          <section>
            <Title order={4} mb="xs">
              5. Content &amp; Reviews
            </Title>
            <Text size="sm" c="dimmed">
              By posting content on the Virtual Lobby or submitting reviews in the Survival Guide, you grant Adormable a
              non-exclusive license to display that content on the platform. Reviews should be honest and based on
              genuine experiences. Moderators may remove content that violates community guidelines.
            </Text>
          </section>

          <Divider />

          <section>
            <Title order={4} mb="xs">
              6. Privacy
            </Title>
            <Text size="sm" c="dimmed">
              We collect only the information necessary to provide our services. Personal data is stored securely and
              never shared with third parties without consent, except as required by law or dormitory regulations.
            </Text>
          </section>

          <Divider />

          <section>
            <Title order={4} mb="xs">
              7. Modifications
            </Title>
            <Text size="sm" c="dimmed">
              Adormable reserves the right to modify these terms at any time. Users will be notified of significant
              changes. Continued use of the platform after modifications constitutes acceptance of the updated terms.
            </Text>
          </section>

          <Divider />

          <Button variant="light" color="pink" radius="xl" component={Link} to="/login">
            Back to Login
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
