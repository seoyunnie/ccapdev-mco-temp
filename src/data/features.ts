import type { DefaultMantineColor } from "@mantine/core";
import type { LinkProps } from "@tanstack/react-router";
import type { CSSProperties, ForwardRefExoticComponent, RefAttributes } from "react";

import { IconBook, IconCompass, IconMessageCircle, type IconProps } from "@tabler/icons-react";

import studyNookFeature from "../assets/features/study-nook.svg";
import survivalGuideFeature from "../assets/features/survival-guide.svg";
import virtualLobbyFeature from "../assets/features/virtual-lobby.svg";
import studyNookHero from "../assets/heroes/study-nook-hero.svg";
import survivalGuideHero from "../assets/heroes/survival-guide-hero.svg";
import virtualLobbyHero from "../assets/heroes/virtual-lobby-hero.svg";

export interface Feature {
  readonly title: string;
  readonly description: string;
  readonly to: LinkProps["to"];
  readonly color: DefaultMantineColor;
  readonly iconComponent: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  readonly image: string;
}

export const FEATURES: readonly Feature[] = [
  {
    title: "The Study Nook",
    description:
      "Reserve study spaces in seconds. Interactive seat maps, 30-minute intervals, and anonymous booking options.",
    to: "/study-nook",
    color: "pink",
    iconComponent: IconBook,
    image: studyNookFeature,
  },
  {
    title: "The Virtual Lobby",
    description:
      "Connect with fellow residents. Post discussions, upvote content, and engage in threaded conversations.",
    to: "/lobby",
    color: "grape",
    iconComponent: IconMessageCircle,
    image: virtualLobbyFeature,
  },
  {
    title: "The Survival Guide",
    description: "Discover local spots. Browse reviews, star ratings, and recommendations from fellow residents.",
    to: "/guide",
    color: "teal",
    iconComponent: IconCompass,
    image: survivalGuideFeature,
  },
];

export interface CarouselFeature {
  readonly title: string;
  readonly description: string;
  readonly background: CSSProperties["background"];
  readonly image: string;
  readonly color: DefaultMantineColor;
}

export const CAROUSEL_FEATURES: readonly CarouselFeature[] = [
  {
    title: "Study Nook",
    description: "Book your ideal study spot with our interactive reservation system.",
    background: "linear-gradient(135deg, #fff0f6, #fcc2d7)",
    image: studyNookHero,
    color: "pink",
  },
  {
    title: "Virtual Lobby",
    description: "Stay connected with the dormitory community through discussions and posts.",
    background: "linear-gradient(135deg, #f3f0ff, #d0bfff)",
    image: virtualLobbyHero,
    color: "grape",
  },
  {
    title: "Survival Guide",
    description: "Find the best local establishments near your dormitory.",
    background: "linear-gradient(135deg, #e6fcf5, #96f2d7)",
    image: survivalGuideHero,
    color: "teal",
  },
];
