import { Paper, RingProgress, Stack, Text, type DefaultMantineColor } from "@mantine/core";

import type { IconComponent } from "../lib/icons.tsx";

import styles from "./stat-card.module.css";

interface StatCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly color?: DefaultMantineColor;
  readonly iconComponent?: IconComponent;
  readonly progress?: number;
}

export function StatCard({ label, value, color = "pink", iconComponent: Icon, progress = 65 }: StatCardProps) {
  return (
    <Paper shadow="md" p="md" radius="md" className={styles.card}>
      <Stack gap={4}>
        <Text className={styles.label} c="dimmed">
          {label}
        </Text>
        <Text className={styles.value}>{value}</Text>
      </Stack>
      {Icon && (
        <RingProgress
          size={60}
          thickness={5}
          sections={[{ value: progress, color }]}
          label={<Icon size={20} style={{ display: "block", margin: "auto" }} />}
        />
      )}
    </Paper>
  );
}
