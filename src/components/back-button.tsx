import type { LinkProps } from "@tanstack/react-router";

import { Button, type DefaultMantineColor } from "@mantine/core";
import { Link } from "@tanstack/react-router";

interface BackButtonProps {
  readonly to: LinkProps["to"];
  readonly label: string;
  readonly color?: DefaultMantineColor;
}

export function BackButton({ to, label, color = "pink" }: BackButtonProps) {
  return (
    <Link to={to}>
      <Button variant="subtle" color={color} mb="md" size="sm">
        ← {label}
      </Button>
    </Link>
  );
}
