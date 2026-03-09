import type { ReactNode } from "react";

import { Box, Text, Title, type DefaultMantineColor, type TitleOrder } from "@mantine/core";

import styles from "./section-header.module.css";

interface SectionHeaderProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly order?: TitleOrder;
  readonly color?: DefaultMantineColor;
  readonly mb?: string;
}

export function SectionHeader({ title, description, order = 1, color = "pink", mb = "xl" }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: `var(--mantine-spacing-${mb})` }}>
      <Title order={order} className={styles.title} mb={description == null ? 0 : "xs"}>
        {title}
      </Title>
      {description != null && (
        <Text c="dimmed" className={styles.description}>
          {description}
          <Box component="span" className={styles.underline} bg={`${color}.6`} />
        </Text>
      )}
    </div>
  );
}
