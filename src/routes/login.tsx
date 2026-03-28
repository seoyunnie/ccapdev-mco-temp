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
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import loginBg from "../assets/backgrounds/login-bg.svg";
import adormableLogo from "../assets/logos/adormable-logo.png";
import { authClient } from "../lib/auth-client.ts";
import { IconAlertCircle } from "../lib/icons.tsx";
import { getSessionStateFn } from "../server/auth.ts";

import styles from "./login.module.css";

interface LoginSearch {
  register?: boolean | undefined;
}

type AuthClientError = { message?: string; status?: number; statusText?: string } | null | undefined;

function getAuthErrorMessage(err: unknown, fallbackMessage: string): string {
  if (typeof err === "string" && err.trim().length > 0) {
    return err;
  }

  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message;
  }

  return fallbackMessage;
}

function getAuthClientErrorMessage(authErr: AuthClientError, fallbackMessage: string): string {
  if (authErr == null) {
    return fallbackMessage;
  }

  if (typeof authErr.message === "string" && authErr.message.trim().length > 0) {
    return authErr.message;
  }

  if (typeof authErr.statusText === "string" && authErr.statusText.trim().length > 0) {
    return authErr.statusText;
  }

  if (typeof authErr.status === "number") {
    return `Request failed (${authErr.status}). Please try again.`;
  }

  return fallbackMessage;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search): LoginSearch => ({
    register: typeof search.register === "boolean" ? search.register : undefined,
  }),
  beforeLoad: async () => {
    const sessionState = await getSessionStateFn();
    if (sessionState.session?.user) {
      throw redirect({ to: sessionState.activeBan == null ? "/dashboard" : "/suspended" });
    }
  },
  head: () => ({ meta: [{ title: "Login | Adormable" }] }),
  component: LoginRegisterPage,
});

function LoginRegisterPage() {
  const { register } = Route.useSearch();
  const [isRegister, setIsRegister] = useState(register === true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginForm = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (v: string) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Invalid email"),
      password: (v: string) => (v.length < 8 ? "Password must be at least 8 characters" : null),
    },
  });

  const registerForm = useForm({
    initialValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
    validate: {
      firstName: (v: string) => (v.trim().length === 0 ? "First name is required" : null),
      lastName: (v: string) => (v.trim().length === 0 ? "Last name is required" : null),
      email: (v: string) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Invalid email"),
      password: (v: string) => (v.length < 8 ? "Password must be at least 8 characters" : null),
      confirmPassword: (v: string, values: { password: string }) =>
        v === values.password ? null : "Passwords do not match",
    },
  });

  const handleLogin = async (values: typeof loginForm.values) => {
    setError("");
    setLoading(true);
    try {
      const { error: authErr } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe,
      });

      if (authErr) {
        setError(getAuthClientErrorMessage(authErr, "Login failed. Please try again."));
        return;
      }

      globalThis.location.assign("/dashboard");
    } catch (authError) {
      setError(getAuthErrorMessage(authError, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: typeof registerForm.values) => {
    setError("");
    setLoading(true);
    try {
      const { error: authErr } = await authClient.signUp.email({
        name: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email,
        password: values.password,
      });

      if (authErr) {
        setError(getAuthClientErrorMessage(authErr, "Registration failed. Please try again."));
        return;
      }

      globalThis.location.assign("/dashboard");
    } catch (authError) {
      setError(getAuthErrorMessage(authError, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.page}
      style={{
        backgroundImage: `linear-gradient(155deg, rgba(255,246,250,0.92) 0%, rgba(255,251,253,0.84) 42%, rgba(247,237,248,0.9) 100%), url(${loginBg})`,
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

        <Paper shadow="md" p={30} mt={30} radius="md" className={styles.formCard}>
          <form onSubmit={isRegister ? registerForm.onSubmit(handleRegister) : loginForm.onSubmit(handleLogin)}>
            <Stack>
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              {isRegister && (
                <Group grow>
                  <TextInput
                    label="First Name"
                    placeholder="Juan"
                    required
                    radius="md"
                    {...registerForm.getInputProps("firstName")}
                  />
                  <TextInput
                    label="Last Name"
                    placeholder="Dela Cruz"
                    required
                    radius="md"
                    {...registerForm.getInputProps("lastName")}
                  />
                </Group>
              )}

              <TextInput
                label="Email"
                placeholder="you@adormable.com"
                required
                radius="md"
                {...(isRegister ? registerForm.getInputProps("email") : loginForm.getInputProps("email"))}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                radius="md"
                {...(isRegister ? registerForm.getInputProps("password") : loginForm.getInputProps("password"))}
              />

              {isRegister && (
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  required
                  radius="md"
                  {...registerForm.getInputProps("confirmPassword")}
                />
              )}

              {!isRegister && (
                <Group justify="space-between">
                  <Checkbox
                    label="Remember me"
                    color="pink"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.currentTarget.checked);
                    }}
                  />
                </Group>
              )}

              <Button type="submit" fullWidth mt="xl" color="pink" radius="md" loading={loading}>
                {isRegister ? "Create Account" : "Sign In"}
              </Button>

              <Divider label="or" labelPosition="center" />

              <Text size="xs" c="dimmed" ta="center">
                By continuing, you agree to our{" "}
                <Anchor component={Link} to="/terms" size="xs" c="pink">
                  Terms of Service
                </Anchor>
                .
              </Text>
            </Stack>
          </form>
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
