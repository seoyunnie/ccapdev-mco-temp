import { Container, SimpleGrid, Skeleton, Stack } from "@mantine/core";

export function PageSkeleton() {
  return (
    <Container size="lg" py="xl">
      <Skeleton height={32} width="40%" mb="xs" />
      <Skeleton height={18} width="60%" mb="xl" />
      <Skeleton height={44} mb="xl" radius="md" />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Stack key={i} gap="sm">
            <Skeleton height={160} radius="md" />
            <Skeleton height={20} width="70%" />
            <Skeleton height={14} width="90%" />
            <Skeleton height={36} radius="xl" />
          </Stack>
        ))}
      </SimpleGrid>
    </Container>
  );
}

export function DetailSkeleton() {
  return (
    <Container size="md" py="xl">
      <Skeleton height={20} width={120} mb="md" />
      <Skeleton height={240} radius="md" mb="lg" />
      <Skeleton height={28} width="50%" mb="xs" />
      <Skeleton height={16} width="80%" mb="xl" />
      <Skeleton height={200} radius="md" mb="lg" />
      <Skeleton height={24} width={160} mb="md" />
      <Stack gap="md">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} height={120} radius="md" />
        ))}
      </Stack>
    </Container>
  );
}
