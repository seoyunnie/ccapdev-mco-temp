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
import { IconAlertCircle } from "@tabler/icons-react";
import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import loginBg from "../assets/backgrounds/login-bg.svg";
import adormableLogo from "../assets/logos/adormable-logo.png";
import { authClient } from "../lib/auth-client.ts";
import { getSessionFn } from "../server/auth.ts";

import styles from "./login.module.css";

interface LoginSearch {
  register?: string | undefined;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search): LoginSearch => ({
    register: typeof search.register === "string" ? search.register : undefined,
  }),
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (session?.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Login | Adormable" }] }),
  component: LoginRegisterPage,
});

function LoginRegisterPage() {
  const { register } = Route.useSearch();
  const [isRegister, setIsRegister] = useState(register === "true");
  const router = useRouter();
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
    const { error: authError } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message ?? "Login failed. Please try again.");
      return;
    }
    void router.navigate({ to: "/dashboard" });
  };

  const handleRegister = async (values: typeof registerForm.values) => {
    setError("");
    setLoading(true);
    const { error: authError } = await authClient.signUp.email({
      name: `${values.firstName.trim()} ${values.lastName.trim()}`,
      email: values.email,
      password: values.password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message ?? "Registration failed. Please try again.");
      return;
    }
    void router.navigate({ to: "/dashboard" });
  };

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
