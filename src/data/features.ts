import type { DefaultMantineColor } from "@mantine/core";
import type { LinkProps } from "@tanstack/react-router";
import type { CSSProperties, ForwardRefExoticComponent, RefAttributes } from "react";

import { IconBook, IconCompass, IconMessageCircle, type IconProps } from "@tabler/icons-react";

export interface Feature {
  readonly title: string;
  readonly description: string;
  readonly to: LinkProps["to"];
  readonly color: DefaultMantineColor;
  readonly iconComponent: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
}

export const FEATURES: readonly Feature[] = [
  {
    title: "The Study Nook",
    description:
      "Reserve study spaces in seconds. Interactive seat maps, 30-minute intervals, and anonymous booking options.",
    to: "/study-nook",
    color: "pink",
    iconComponent: IconBook,
  },
  {
    title: "The Virtual Lobby",
    description:
      "Connect with fellow residents. Post discussions, upvote content, and engage in threaded conversations.",
    to: "/lobby",
    color: "grape",
    iconComponent: IconMessageCircle,
  },
  {
    title: "The Survival Guide",
    description: "Discover local spots. Browse reviews, star ratings, and recommendations from fellow residents.",
    to: "/guide",
    color: "teal",
    iconComponent: IconCompass,
  },
];

export interface CarouselFeature {
  readonly title: string;
  readonly description: string;
  readonly background: CSSProperties["background"];
}

export const CAROUSEL_FEATURES: readonly CarouselFeature[] = [
  {
    title: "Study Nook",
    description: "Book your ideal study spot with our interactive reservation system.",
    background: "linear-gradient(135deg, #fff0f6, #fcc2d7)",
  },
  {
    title: "Virtual Lobby",
    description: "Stay connected with the dormitory community through discussions and posts.",
    background: "linear-gradient(135deg, #f3f0ff, #d0bfff)",
  },
  {
    title: "Survival Guide",
    description: "Find the best local establishments near your dormitory.",
    background: "linear-gradient(135deg, #e6fcf5, #96f2d7)",
  },
];
