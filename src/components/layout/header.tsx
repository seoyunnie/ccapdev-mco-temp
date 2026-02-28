import { AppShell, Avatar, Burger, Button, Container, Group, Menu, Text, Title } from "@mantine/core";
import { IconChevronDown, IconLogout, IconSettings, IconShield, IconUser } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "../../contexts/auth-context.tsx";
import { NAV_ITEMS } from "../../data/nav-items.ts";
import { AppLink } from "../app-link.tsx";

import styles from "./header.module.css";

export interface HeaderProps {
  isBurgerOpen: boolean;
  onSidebarToggle: () => void;
}

export function Header({ isBurgerOpen, onSidebarToggle }: Readonly<HeaderProps>) {
  const { isLoggedIn, role, name, logout } = useAuth();
  const isStaff = role === "concierge" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <AppShell.Header className={styles.applicationHeader}>
      <Container size="xl" className={styles.headerInnerLayout}>
        <Group gap="xs">
          <Burger
            opened={isBurgerOpen}
            onClick={onSidebarToggle}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />
          <Link to="/" style={{ textDecoration: "none" }}>
            <Title order={3}>
              <Text component="span" size="xl" fw={900} c="pink" style={{ letterSpacing: "-0.02em" }}>
                Adormable
              </Text>
            </Title>
          </Link>
        </Group>

        <Group gap={5} visibleFrom="sm">
          {NAV_ITEMS[isLoggedIn ? "auth" : "guest"].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={styles.navigationLink}
              data-active={location.pathname === link.to || undefined}
            >
              {link.label}
            </Link>
          ))}

          {isStaff && (
            <Menu trigger="hover" openDelay={100} closeDelay={200}>
              <Menu.Target>
                <button
                  className={styles.navigationLink}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Staff <IconChevronDown size={14} />
                </button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconShield size={16} />} component={AppLink} to="/concierge">
                  Concierge
                </Menu.Item>
                <Menu.Item leftSection={<IconShield size={16} />} component={AppLink} to="/moderation">
                  Moderation
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}

          {isAdmin && (
            <Menu trigger="hover" openDelay={100} closeDelay={200}>
              <Menu.Target>
                <button
                  className={styles.navigationLink}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Admin <IconChevronDown size={14} />
                </button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconSettings size={16} />} component={AppLink} to="/admin">
                  Control Panel
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />} component={AppLink} to="/admin/establishments">
                  Establishments
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />} component={AppLink} to="/admin/logs">
                  System Logs
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        <Group gap="sm" visibleFrom="sm">
          {isLoggedIn ? (
            <Menu>
              <Menu.Target>
                <Button variant="subtle" color="dark" size="sm" radius="xl">
                  <Avatar color="pink" radius="xl" size="sm" mr={8}>
                    {name.slice(0, 2).toUpperCase()}
                  </Avatar>
                  {name}
                  <IconChevronDown size={14} style={{ marginLeft: 4 }} />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={16} />} component={AppLink} to="/profile">
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={logout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <>
              <Button variant="default" radius="xl" component={AppLink} to="/login" size="sm">
                Log In
              </Button>
              <Button color="pink" radius="xl" component={AppLink} to="/login" search={{ register: "true" }} size="sm">
                Register
              </Button>
            </>
          )}
        </Group>
      </Container>
    </AppShell.Header>
  );
}
