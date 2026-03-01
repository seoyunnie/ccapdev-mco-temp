import { Button, Divider, Drawer, NavLink, Stack } from "@mantine/core";
import { IconSettings, IconShield } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "../../contexts/auth-context.tsx";
import { NAV_ITEMS } from "../../data/nav-items.ts";
import { LinkButton } from "../link-button.tsx";

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: Readonly<SidebarProps>) {
  const { isLoggedIn, role, logout } = useAuth();
  const isStaff = role === "concierge" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <Drawer opened={isOpen} onClose={onToggle} size="xs" title="Adormable">
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
              onClick={close}
            />
            <NavLink
              label="Moderation"
              leftSection={<IconShield size={18} />}
              component={Link}
              to="/moderation"
              onClick={close}
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
              onClick={close}
            />
            <NavLink
              label="Establishments"
              leftSection={<IconSettings size={18} />}
              component={Link}
              to="/admin/establishments"
              onClick={close}
            />
            <NavLink
              label="System Logs"
              leftSection={<IconSettings size={18} />}
              component={Link}
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
            <Button component={Link} to="/login" variant="default" fullWidth radius="xl" onClick={close}>
              Log In
            </Button>
            <LinkButton
              to="/login"
              search={{ register: "true" }}
              color="pink"
              fullWidth
              mt="xs"
              radius="xl"
              onClick={close}
            >
              Register
            </LinkButton>
          </>
        )}
      </Stack>
    </Drawer>
  );
}
