import { Button, Divider, Drawer, NavLink, Stack } from "@mantine/core";
import { IconSettings, IconShield } from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";

import adormableLogo from "../../assets/logos/adormable-logo.png";
import { useAuth, UserRole } from "../../contexts/auth-context.tsx";
import { NAV_ITEMS } from "../../data/nav-items.ts";
import { LinkButton } from "../link-button.tsx";

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: Readonly<SidebarProps>) {
  const { isLoggedIn, role, signOut } = useAuth();
  const isStaff = role === UserRole.CONCIERGE || role === UserRole.ADMIN;
  const isAdmin = role === UserRole.ADMIN;

  const location = useLocation();

  return (
    <Drawer
      opened={isOpen}
      onClose={onToggle}
      size="xs"
      title={<img src={adormableLogo} alt="Adormable" height={36} />}
    >
      <Stack gap={0}>
        {NAV_ITEMS[isLoggedIn ? "auth" : "guest"].map((item) => (
          <NavLink
            key={item.to}
            label={item.label}
            leftSection={item.iconComponent && <item.iconComponent size={18} />}
            component={Link}
            to={item.to}
            active={location.pathname === item.to}
            onClick={onToggle}
          />
        ))}

        {isStaff && (
          <>
            <Divider my="sm" label="Staff" />
            <NavLink
              label="Concierge"
              leftSection={<IconShield size={18} />}
              component={Link}
              to="/concierge"
              onClick={onToggle}
            />
            <NavLink
              label="Moderation"
              leftSection={<IconShield size={18} />}
              component={Link}
              to="/moderation"
              onClick={onToggle}
            />
          </>
        )}
        {isAdmin && (
          <>
            <Divider my="sm" label="Admin" />
            <NavLink
              label="Control Panel"
              leftSection={<IconSettings size={18} />}
              component={Link}
              to="/admin"
              onClick={onToggle}
            />
            <NavLink
              label="Establishments"
              leftSection={<IconSettings size={18} />}
              component={Link}
              to="/admin/establishments"
              onClick={onToggle}
            />
            <NavLink
              label="System Logs"
              leftSection={<IconSettings size={18} />}
              component={Link}
              to="/admin/logs"
              onClick={onToggle}
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
              void signOut();
              onToggle();
            }}
          >
            Logout
          </Button>
        ) : (
          <>
            <Button component={Link} to="/login" variant="default" fullWidth radius="xl" onClick={onToggle}>
              Log In
            </Button>
            <LinkButton to="/signup" color="pink" fullWidth mt="xs" radius="xl" onClick={onToggle}>
              Register
            </LinkButton>
          </>
        )}
      </Stack>
    </Drawer>
  );
}
