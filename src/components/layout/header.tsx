import { AppShell, Avatar, Burger, Button, Container, Group, Menu } from "@mantine/core";
import { IconChevronDown, IconLogout, IconSettings, IconShield, IconUser } from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";

import defaultAdmin from "../../assets/avatars/default-admin.svg";
import defaultAvatarFemale from "../../assets/avatars/default-avatar-female.svg";
import defaultConcierge from "../../assets/avatars/default-concierge.svg";
import adormableLogo from "../../assets/logos/adormable-logo.png";
import { useAuth, UserRole } from "../../contexts/auth-context.tsx";
import { NAV_ITEMS } from "../../data/nav-items.ts";
import { LinkButton } from "../link-button.tsx";

import styles from "./header.module.css";

export interface HeaderProps {
  isBurgerOpen: boolean;
  onSidebarToggle: () => void;
}

export function Header({ isBurgerOpen, onSidebarToggle }: Readonly<HeaderProps>) {
  const { isLoggedIn, role, name, logout } = useAuth();
  const isStaff = role === UserRole.CONCIERGE || role === UserRole.ADMIN;
  const isAdmin = role === UserRole.ADMIN;
  let avatarSrc = defaultAvatarFemale;
  if (role === UserRole.ADMIN) {
    avatarSrc = defaultAdmin;
  } else if (role === UserRole.CONCIERGE) {
    avatarSrc = defaultConcierge;
  }

  const location = useLocation();

  return (
    <AppShell.Header className={styles.root}>
      <Container size="xl" className={styles.container}>
        <Group gap="xs">
          <Burger
            opened={isBurgerOpen}
            onClick={onSidebarToggle}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />
          <Link to="/" style={{ textDecoration: "none" }}>
            <img src={adormableLogo} alt="Adormable" height={44} style={{ display: "block" }} />
          </Link>
        </Group>

        <Group gap={5} visibleFrom="sm">
          {NAV_ITEMS[isLoggedIn ? "auth" : "guest"].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={styles.navItem}
              data-active={location.pathname === link.to || undefined}
            >
              {link.label}
            </Link>
          ))}

          {isStaff && (
            <Menu trigger="hover" openDelay={100} closeDelay={200}>
              <Menu.Target>
                <button
                  className={styles.navItem}
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
                <Menu.Item leftSection={<IconShield size={16} />} component={Link} to="/concierge">
                  Concierge
                </Menu.Item>
                <Menu.Item leftSection={<IconShield size={16} />} component={Link} to="/moderation">
                  Moderation
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}

          {isAdmin && (
            <Menu trigger="hover" openDelay={100} closeDelay={200}>
              <Menu.Target>
                <button
                  className={styles.navItem}
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
                <Menu.Item leftSection={<IconSettings size={16} />} component={Link} to="/admin">
                  Control Panel
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />} component={Link} to="/admin/establishments">
                  Establishments
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />} component={Link} to="/admin/logs">
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
                  <Avatar src={avatarSrc} alt={name} radius="xl" size="sm" mr={8} />
                  {name}
                  <IconChevronDown size={14} style={{ marginLeft: 4 }} />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={16} />} component={Link} to="/profile">
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
              <Button variant="default" radius="xl" component={Link} to="/login" size="sm">
                Log In
              </Button>
              <LinkButton color="pink" radius="xl" to="/login" search={{ register: "true" }} size="sm">
                Register
              </LinkButton>
            </>
          )}
        </Group>
      </Container>
    </AppShell.Header>
  );
}
