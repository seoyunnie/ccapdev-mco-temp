import { AppShell, Burger, Button, Container, Group, Menu } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";

import adormableLogo from "../../assets/logos/adormable-logo.png";
import { NAV_ITEMS } from "../../features/navigation/nav-items.ts";
import { useAuth, UserRole } from "../../lib/auth-context.tsx";
import { IconChevronDown, IconLogout, IconSettings, IconShield, IconUser } from "../../lib/icons.tsx";
import { LinkButton } from "../link-button.tsx";
import { UserAvatar } from "../user-avatar.tsx";

import styles from "./header.module.css";

export interface HeaderProps {
  isBurgerOpen: boolean;
  onSidebarToggle: () => void;
}

export function Header({ isBurgerOpen, onSidebarToggle }: Readonly<HeaderProps>) {
  const { isLoggedIn, role, name, image, signOut } = useAuth();
  const isStaff = role === UserRole.CONCIERGE || role === UserRole.ADMIN;
  const isAdmin = role === UserRole.ADMIN;

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
                <Menu.Item leftSection={<IconSettings size={16} />} component={Link} to="/admin/zones">
                  Study Zones
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
                  <UserAvatar name={name} image={image} radius="xl" size="sm" mr={8} />
                  {name}
                  <IconChevronDown size={14} style={{ marginLeft: 4 }} />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={16} />} component={Link} to="/profile">
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={signOut}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <>
              <Button variant="default" radius="xl" component={Link} to="/login" size="sm">
                Log In
              </Button>
              <LinkButton color="pink" radius="xl" to="/login" search={{ register: true }} size="sm">
                Register
              </LinkButton>
            </>
          )}
        </Group>
      </Container>
    </AppShell.Header>
  );
}
