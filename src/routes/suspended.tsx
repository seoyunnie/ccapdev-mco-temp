import { Alert, Anchor, Button, Container, Divider, Group, Paper, Stack, Text, Textarea, Title } from "@mantine/core";
import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import loginBg from "../assets/backgrounds/login-bg.svg";
import adormableLogo from "../assets/logos/adormable-logo.png";
import { authClient } from "../lib/auth-client.ts";
import { IconAlertCircle } from "../lib/icons.tsx";
import { getActiveBanStatusFn, getSessionStateFn } from "../server/auth.ts";
import { submitBanAppeal } from "../server/moderation.ts";

import styles from "./login.module.css";

export const Route = createFileRoute("/suspended")({
  beforeLoad: async () => {
    const sessionState = await getSessionStateFn();
    if (sessionState.session == null) {
      throw redirect({ to: "/login" });
    }
    if (sessionState.activeBan == null) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: () => getActiveBanStatusFn(),
  head: () => ({ meta: [{ title: "Account Restricted | Adormable" }] }),
  component: SuspendedAccountPage,
});

function SuspendedAccountPage() {
  const ban = Route.useLoaderData();
  const router = useRouter();
  const [appealMessage, setAppealMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (ban == null) {
    return null;
  }

  return (
    <div
      className={styles.page}
      style={{
        backgroundImage: `linear-gradient(155deg, rgba(255,246,250,0.92) 0%, rgba(255,251,253,0.84) 42%, rgba(247,237,248,0.9) 100%), url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container size={460} my={40}>
        <img src={adormableLogo} alt="Adormable" style={{ display: "block", margin: "0 auto 8px auto", height: 64 }} />
        <Title ta="center" className={styles.title}>
          Account access is currently restricted
        </Title>
        <Text className={styles.subtitle}>
          Your session is still valid, but the account is paused while the current ban is active.
        </Text>

        <Paper shadow="md" p={30} mt={30} radius="md" className={styles.formCard}>
          <Stack>
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              {ban.reason}
            </Alert>
            <Text size="sm" c="dimmed">
              {ban.isPermanent
                ? "This restriction has no scheduled expiry yet."
                : `Access returns automatically on ${new Date(ban.expiresAt ?? "").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}.`}
            </Text>
            <Divider label="Appeal" labelPosition="center" />
            {ban.appeal != null && (
              <Paper withBorder radius="md" p="sm">
                <Text fw={600} size="sm">
                  Current appeal: {ban.appeal.status}
                </Text>
                <Text size="sm" c="dimmed">
                  {ban.appeal.message}
                </Text>
                {ban.appeal.staffNote != null && ban.appeal.staffNote.length > 0 && (
                  <Text size="sm" mt="xs">
                    Staff note: {ban.appeal.staffNote}
                  </Text>
                )}
              </Paper>
            )}
            <Textarea
              label="Appeal message"
              placeholder="Explain the situation, what happened, and what you will do differently."
              minRows={5}
              value={appealMessage}
              disabled={ban.appeal?.status === "pending"}
              onChange={(event) => {
                setAppealMessage(event.currentTarget.value);
              }}
            />
            <Group justify="space-between" align="flex-end">
              <Text size="xs" c="dimmed" maw={250}>
                Need direct help? Reach staff via the support details in the dorm office or the moderation desk.
              </Text>
              <Button
                color="pink"
                radius="md"
                loading={submitting}
                disabled={ban.appeal?.status === "pending" || !appealMessage.trim()}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await submitBanAppeal({ data: { message: appealMessage } });
                    setAppealMessage("");
                    void router.invalidate();
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                Submit appeal
              </Button>
            </Group>
            <Divider label="Session" labelPosition="center" />
            <Group grow>
              <Button variant="default" component={Link} to="/">
                Public home
              </Button>
              <Button
                color="gray"
                variant="light"
                onClick={async () => {
                  await authClient.signOut();
                  void router.navigate({ to: "/login" });
                }}
              >
                Sign out
              </Button>
            </Group>
            <Text size="xs" c="dimmed" ta="center">
              By remaining signed in you can track appeal updates here. You can also return to the public pages from the
              <Anchor component={Link} to="/" size="xs" c="pink">
                {" "}
                home screen
              </Anchor>
              .
            </Text>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
