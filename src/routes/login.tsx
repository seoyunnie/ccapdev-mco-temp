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

import { authClient } from "../lib/auth-client.ts";

import styles from "./login.module.css";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (session?.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Invalid email"),
      password: (v) => (v.length < 1 ? "Password is required" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError("");
    setLoading(true);
    const { error: authError } = await authClient.signIn.email({ email: values.email, password: values.password });
    setLoading(false);

    if (authError) {
      setError(authError.message ?? "Invalid email or password");
      return;
    }

    void router.navigate({ to: "/dashboard" });
  };

  return (
    <div className={styles.page}>
      <Container size={420} my={40}>
        <Text ta="center" size="lg" fw={800} c="pink" mb={4}>
          HELLO KUROMI.
        </Text>
        <Title ta="center" className={styles.title}>
          Welcome back!
        </Title>
        <Text className={styles.subtitle}>
          Don&apos;t have an account?{" "}
          <Anchor component={Link} to="/signup" size="sm" c="pink">
            Register
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <TextInput
                label="Email"
                placeholder="you@adormable.com"
                required
                radius="md"
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                radius="md"
                {...form.getInputProps("password")}
              />

              <Group justify="space-between">
                <Checkbox label="Remember me" color="pink" />
              </Group>

              <Button type="submit" fullWidth mt="xl" color="pink" radius="md" loading={loading}>
                Sign In
              </Button>

              <Divider label="or" labelPosition="center" />

              <Text size="xs" c="dimmed" ta="center">
                By continuing, you agree to our Terms of Service.
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
