import type { LinkProps } from "@tanstack/react-router";

import {
  IconBook,
  IconCompass,
  IconHome,
  IconLayoutDashboard,
  IconMessageCircle,
  IconUser,
  type IconComponent,
} from "../../lib/icons.tsx";

export interface NavItem {
  readonly label: Capitalize<string>;
  readonly to: LinkProps["to"];
  readonly iconComponent?: IconComponent;
}

const guestItems: readonly NavItem[] = [
  { label: "Home", to: "/", iconComponent: IconHome },
  { label: "Study Nook", to: "/study-nook", iconComponent: IconBook },
  { label: "Lobby", to: "/lobby", iconComponent: IconMessageCircle },
  { label: "Survival Guide", to: "/guide", iconComponent: IconCompass },
];

const authItems: readonly NavItem[] = [
  { label: "Dashboard", to: "/dashboard", iconComponent: IconLayoutDashboard },
  { label: "Study Nook", to: "/study-nook", iconComponent: IconBook },
  { label: "Lobby", to: "/lobby", iconComponent: IconMessageCircle },
  { label: "Survival Guide", to: "/guide", iconComponent: IconCompass },
  { label: "Profile", to: "/profile", iconComponent: IconUser },
];

export const NAV_ITEMS = { guest: guestItems, auth: authItems } as const;
