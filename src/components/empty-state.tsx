import { Text } from "@mantine/core";

import styles from "./empty-state.module.css";

interface EmptyStateProps {
  readonly image: string;
  readonly message: string;
}

export function EmptyState({ image, message }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <img src={image} alt="No results found" className={styles.image} />
      <Text c="dimmed" ta="center">
        {message}
      </Text>
    </div>
  );
}
