import type { LinkProps } from "@tanstack/react-router";

export interface FooterLinkItem {
  readonly label: Capitalize<string>;
  readonly to?: LinkProps["to"];
  readonly href?: string;
  readonly disabled?: boolean;
}

export interface FooterItem {
  readonly title: Capitalize<string>;
  readonly links: readonly FooterLinkItem[];
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
      { label: "Terms of Service", to: "/terms" },
      { label: "Privacy Policy", href: "/terms#privacy" },
      { label: "Support Channels", href: "/terms#support" },
    ],
  },
];
