import type { DefaultMantineColor } from "@mantine/core";
import type { LinkProps } from "@tanstack/react-router";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import { type IconProps, IconBook, IconMessageCircle, IconStar } from "@tabler/icons-react";

export interface QuickAction {
  readonly title: string;
  readonly description: string;
  readonly to: LinkProps["to"];
  readonly color: DefaultMantineColor;
  readonly iconComponent: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
}

export const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    title: "Book a Slot",
    description: "Reserve your study space",
    to: "/study-nook",
    color: "pink",
    iconComponent: IconBook,
  },
  {
    title: "Post in Lobby",
    description: "Share with the community",
    to: "/lobby",
    color: "grape",
    iconComponent: IconMessageCircle,
  },
  { title: "Write a Review", description: "Rate a local spot", to: "/guide", color: "teal", iconComponent: IconStar },
];
