import type { NavItem } from "./nav-items.ts";

export interface FooterItem {
  readonly title: Capitalize<string>;
  readonly links: readonly NavItem[];
}

export const FOOTER_ITEMS: readonly FooterItem[] = [
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
