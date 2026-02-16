import {
  AppShell,
  Group,
  Title,
  Button,
  Text,
  Burger,
  Drawer,
  Stack,
  NavLink,
  Container,
  Box,
  Menu,
  Avatar,
  Divider,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome,
  IconBook,
  IconMessageCircle,
  IconCompass,
  IconUser,
  IconLogout,
  IconShield,
  IconSettings,
  IconChevronDown,
  IconLayoutDashboard,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandFacebook,
} from "@tabler/icons-react";
import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { AppLink } from "../components/app-link.tsx";
import { useAuth } from "../contexts/auth-context.tsx";
import classes from "./_app.module.css";

const guestLinks = [
  { label: "Home", to: "/" },
  { label: "Study Nook", to: "/study-nook" },
  { label: "Lobby", to: "/lobby" },
  { label: "Survival Guide", to: "/guide" },
];

const authLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Study Nook", to: "/study-nook" },
  { label: "Lobby", to: "/lobby" },
  { label: "Survival Guide", to: "/guide" },
];

const guestMobileLinks = [
  { label: "Home", to: "/", icon: IconHome },
  { label: "Study Nook", to: "/study-nook", icon: IconBook },
  { label: "Lobby", to: "/lobby", icon: IconMessageCircle },
  { label: "Survival Guide", to: "/guide", icon: IconCompass },
];

const authMobileLinks = [
  { label: "Dashboard", to: "/dashboard", icon: IconLayoutDashboard },
  { label: "Study Nook", to: "/study-nook", icon: IconBook },
  { label: "Lobby", to: "/lobby", icon: IconMessageCircle },
  { label: "Survival Guide", to: "/guide", icon: IconCompass },
  { label: "Profile", to: "/profile", icon: IconUser },
];

const footerData = [
  {
    title: "Features",
    links: [
      { label: "Study Nook", to: "/study-nook" },
      { label: "Virtual Lobby", to: "/lobby" },
      { label: "Survival Guide", to: "/guide" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", to: "/login" },
      { label: "Register", to: "/login" },
      { label: "Profile", to: "/profile" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/" },
      { label: "Contact Us", to: "/" },
      { label: "Privacy Policy", to: "/" },
    ],
  },
];

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const { isLoggedIn, role, name, logout } = useAuth();

  const showStaff = role === "concierge" || role === "admin";
  const showAdmin = role === "admin";

  const footerGroups = footerData.map((group) => (
    <div className={classes.footerGroupWrapper} key={group.title}>
      <Text className={classes.footerGroupTitle}>{group.title}</Text>
      {group.links.map((link) => (
        <Text key={link.label} className={classes.footerLink} component={AppLink} to={link.to}>
          {link.label}
        </Text>
      ))}
    </div>
  ));

  return (
    <AppShell header={{ height: 70 }} padding={0}>
      <AppShell.Header className={classes.applicationHeader}>
        <Container size="xl" className={classes.headerInnerLayout}>
          <Group gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
            <Link to="/" style={{ textDecoration: "none" }}>
              <Title order={3}>
                <Text component="span" size="xl" fw={900} c="pink" style={{ letterSpacing: "-0.02em" }}>
                  Adormable
                </Text>
              </Title>
            </Link>
          </Group>

          <Group gap={5} visibleFrom="sm">
            {(isLoggedIn ? authLinks : guestLinks).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={classes.navigationLink}
                data-active={location.pathname === link.to || undefined}
              >
                {link.label}
              </Link>
            ))}

            {showStaff && (
              <Menu trigger="hover" openDelay={100} closeDelay={200}>
                <Menu.Target>
                  <button
                    className={classes.navigationLink}
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

            {showAdmin && (
              <Menu trigger="hover" openDelay={100} closeDelay={200}>
                <Menu.Target>
                  <button
                    className={classes.navigationLink}
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
                <Button
                  color="pink"
                  radius="xl"
                  component={AppLink}
                  to="/login"
                  search={{ register: "true" }}
                  size="sm"
                >
                  Register
                </Button>
              </>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      <Drawer opened={opened} onClose={close} size="xs" title="Adormable">
        <Stack gap={0}>
          {(isLoggedIn ? authMobileLinks : guestMobileLinks).map((item) => (
            <NavLink
              key={item.to}
              label={item.label}
              leftSection={<item.icon size={18} />}
              component={AppLink}
              to={item.to}
              active={location.pathname === item.to}
              onClick={close}
            />
          ))}

          {showStaff && (
            <>
              <Divider my="sm" label="Staff" />
              <NavLink
                label="Concierge"
                leftSection={<IconShield size={18} />}
                component={AppLink}
                to="/concierge"
                onClick={close}
              />
              <NavLink
                label="Moderation"
                leftSection={<IconShield size={18} />}
                component={AppLink}
                to="/moderation"
                onClick={close}
              />
            </>
          )}
          {showAdmin && (
            <>
              <Divider my="sm" label="Admin" />
              <NavLink
                label="Control Panel"
                leftSection={<IconSettings size={18} />}
                component={AppLink}
                to="/admin"
                onClick={close}
              />
              <NavLink
                label="Establishments"
                leftSection={<IconSettings size={18} />}
                component={AppLink}
                to="/admin/establishments"
                onClick={close}
              />
              <NavLink
                label="System Logs"
                leftSection={<IconSettings size={18} />}
                component={AppLink}
                to="/admin/logs"
                onClick={close}
              />
            </>
          )}

          <Divider my="sm" />
          {isLoggedIn ? (
            <Button
              color="red"
              variant="light"
              fullWidth
              radius="xl"
              onClick={() => {
                logout();
                close();
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button component={AppLink} to="/login" variant="default" fullWidth radius="xl" onClick={close}>
                Log In
              </Button>
              <Button
                component={AppLink}
                to="/login"
                search={{ register: "true" }}
                color="pink"
                fullWidth
                mt="xs"
                radius="xl"
                onClick={close}
              >
                Register
              </Button>
            </>
          )}
        </Stack>
      </Drawer>

      <AppShell.Main>
        <Box pt={70}>
          <Outlet />
        </Box>
      </AppShell.Main>

      <footer className={classes.applicationFooter}>
        <Container size="xl">
          <div className={classes.footerInnerLayout}>
            <div className={classes.footerLogoSection}>
              <Title order={3} c="pink" style={{ letterSpacing: "-0.02em" }}>
                Adormable
              </Title>
              <Text size="sm" c="dimmed" className={classes.footerDescriptionText}>
                Your all-in-one dormitory companion since 2026.
              </Text>
            </div>
            <div className={classes.footerLinkGroups}>{footerGroups}</div>
          </div>
          <div className={classes.footerBottomBar}>
            <Text c="dimmed" size="sm">
              &copy; 2026 Adormable All rights reserved.
            </Text>
            <Group gap={0} className={classes.socialIconGroup} justify="flex-end" wrap="nowrap">
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconBrandTwitter size={18} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconBrandFacebook size={18} stroke={1.5} />
              </ActionIcon>
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconBrandInstagram size={18} stroke={1.5} />
              </ActionIcon>
            </Group>
          </div>
        </Container>
      </footer>
    </AppShell>
  );
}
