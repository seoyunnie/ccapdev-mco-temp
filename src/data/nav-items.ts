import type { ForwardRefExoticComponent, RefAttributes } from "react";

import {
  IconBook,
  IconCompass,
  IconHome,
  IconLayoutDashboard,
  IconMessageCircle,
  IconUser,
  type IconProps,
} from "@tabler/icons-react";

export interface NavItem {
  readonly label: Capitalize<string>;
  readonly to: string;
  readonly iconComponent?: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
}

const guestItem: readonly NavItem[] = [
  { label: "Home", to: "/", iconComponent: IconHome },
  { label: "Study Nook", to: "/study-nook", iconComponent: IconBook },
  { label: "Lobby", to: "/lobby", iconComponent: IconMessageCircle },
  { label: "Survival Guide", to: "/guide", iconComponent: IconCompass },
];

const authLinks: readonly NavItem[] = [
  { label: "Dashboard", to: "/dashboard", iconComponent: IconLayoutDashboard },
  { label: "Study Nook", to: "/study-nook", iconComponent: IconBook },
  { label: "Lobby", to: "/lobby", iconComponent: IconMessageCircle },
  { label: "Survival Guide", to: "/guide", iconComponent: IconCompass },
  { label: "Profile", to: "/profile", iconComponent: IconUser },
];

export const NAV_ITEMS = { guest: guestItem, auth: authLinks } as const;
