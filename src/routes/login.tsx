import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Anchor,
  Stack,
  Divider,
  Group,
} from "@mantine/core";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import loginBg from "../assets/backgrounds/login-bg.svg";
import adormableLogo from "../assets/logos/adormable-logo.png";
import { useAuth } from "../contexts/auth-context.tsx";

import styles from "./login.module.css";

interface LoginSearch {
  register?: string | undefined;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search): LoginSearch => ({
    register: typeof search.register === "string" ? search.register : undefined,
  }),
  head: () => ({ meta: [{ title: "Login | Adormable" }] }),
  component: LoginRegisterPage,
});

function LoginRegisterPage() {
  const { register } = Route.useSearch();
  const [isRegister, setIsRegister] = useState(register === "true");
  const { login } = useAuth();

  return (
    <div
      className={styles.page}
      style={{
        backgroundImage: `linear-gradient(160deg, rgba(255,240,246,0.85) 0%, rgba(250,250,250,0.85) 50%, rgba(243,229,245,0.85) 100%), url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container size={420} my={40}>
        <img src={adormableLogo} alt="Adormable" style={{ display: "block", margin: "0 auto 8px auto", height: 64 }} />
        <Title ta="center" className={styles.title}>
          {isRegister ? "Create your account" : "Welcome back!"}
        </Title>
        <Text className={styles.subtitle}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <Anchor
            component="button"
            size="sm"
            c="pink"
            onClick={() => {
              setIsRegister(!isRegister);
            }}
          >
            {isRegister ? "Login" : "Register"}
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Stack>
            {isRegister && (
              <Group grow>
                <TextInput label="First Name" placeholder="Juan" required radius="md" />
                <TextInput label="Last Name" placeholder="Dela Cruz" required radius="md" />
              </Group>
            )}

            <TextInput label="Email" placeholder="you@adormable.com" required radius="md" />

            <PasswordInput label="Password" placeholder="Your password" required radius="md" />

            {isRegister && (
              <PasswordInput label="Confirm Password" placeholder="Confirm your password" required radius="md" />
            )}

            {!isRegister && (
              <Group justify="space-between">
                <Checkbox label="Remember me" color="pink" />
                <Anchor component="button" size="sm" c="pink">
                  Forgot password?
                </Anchor>
              </Group>
            )}

            <Button
              component={Link}
              fullWidth
              mt="xl"
              color="pink"
              radius="md"
              to="/dashboard"
              onClick={() => {
                login("admin", isRegister ? "New Resident" : "OPPENHEIMER");
              }}
            >
              {isRegister ? "Create Account" : "Sign In"}
            </Button>

            <Divider label="or" labelPosition="center" />

            <Text size="xs" c="dimmed" ta="center">
              By continuing, you agree to our Terms of Service.
            </Text>
          </Stack>
        </Paper>

        <Link to="/" style={{ textDecoration: "none" }}>
          <Button variant="subtle" color="pink" fullWidth mt="md" radius="md">
            Back to Home
          </Button>
        </Link>
      </Container>
    </div>
  );
}
