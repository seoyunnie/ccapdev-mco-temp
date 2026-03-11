import type { DefaultMantineColor } from "@mantine/core";
import type { LinkProps } from "@tanstack/react-router";

import studyNookFeature from "../../assets/features/study-nook.svg";
import survivalGuideFeature from "../../assets/features/survival-guide.svg";
import virtualLobbyFeature from "../../assets/features/virtual-lobby.svg";
import { IconBook, IconCompass, IconMessageCircle, type IconComponent } from "../../lib/icons.tsx";

export interface Feature {
  readonly title: string;
  readonly description: string;
  readonly to: LinkProps["to"];
  readonly color: DefaultMantineColor;
  readonly iconComponent: IconComponent;
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
