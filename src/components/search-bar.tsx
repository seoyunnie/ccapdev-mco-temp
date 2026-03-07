import { Group, Select, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

interface SearchBarProps {
  readonly searchValue: string;
  readonly onSearchChange: (value: string) => void;
  readonly searchPlaceholder?: string;
  readonly filterValue?: string | null;
  readonly onFilterChange?: (value: string | null) => void;
  readonly filterData?: string[];
  readonly filterPlaceholder?: string;
}

export function SearchBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterValue,
  onFilterChange,
  filterData,
  filterPlaceholder = "Filter...",
}: SearchBarProps) {
  return (
    <Group grow mb="xl">
      <TextInput
        placeholder={searchPlaceholder}
        leftSection={<IconSearch size={16} />}
        value={searchValue}
        onChange={(e) => {
          onSearchChange(e.currentTarget.value);
        }}
        size="md"
      />
      {filterData && onFilterChange && (
        <Select
          placeholder={filterPlaceholder}
          data={filterData}
          value={filterValue}
          onChange={onFilterChange}
          size="md"
          clearable
        />
      )}
    </Group>
  );
}
