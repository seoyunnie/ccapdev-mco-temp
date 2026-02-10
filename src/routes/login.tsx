import { useState } from "react";
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
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext.tsx";
import classes from "./login.module.css";

interface LoginSearch {
  register?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    register: typeof search.register === "string" ? search.register : undefined,
  }),
  component: LoginRegisterPage,
});

function LoginRegisterPage() {
  const { register } = Route.useSearch();
  const [isRegister, setIsRegister] = useState(register === "true");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = () => {
    login("resident", isRegister ? "New Resident" : "OPPENHEIMER");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className={classes.authenticationPageWrapper}>
      <Container size={420} my={40}>
        <Text ta="center" size="lg" fw={800} c="pink" mb={4}>
          HELLO KUROMI.
        </Text>
        <Title ta="center" className={classes.authenticationTitle}>
          {isRegister ? "Create your account" : "Welcome back!"}
        </Title>
        <Text className={classes.authenticationSubtitle}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <Anchor component="button" size="sm" c="pink" onClick={() => setIsRegister(!isRegister)}>
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

            <Button fullWidth mt="xl" color="pink" radius="md" onClick={handleSubmit}>
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
