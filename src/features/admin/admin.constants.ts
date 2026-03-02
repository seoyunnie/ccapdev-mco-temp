import type { DefaultMantineColor } from "@mantine/core";

import { UserRole } from "../../contexts/auth-context.tsx";

export const ROLE_COLORS: Record<UserRole, DefaultMantineColor> = {
  [UserRole.GUEST]: "gray",
  [UserRole.RESIDENT]: "pink",
  [UserRole.CONCIERGE]: "teal",
  [UserRole.ADMIN]: "red",
};
