import { Button, Menu } from "@mantine/core";
import { type ReactNode } from "react";

import { IconChevronDown } from "../lib/icons.tsx";

interface RowActionMenuItem {
  readonly label: string;
  readonly color?: string;
  readonly leftSection?: ReactNode;
  readonly disabled?: boolean;
  readonly onClick: () => void | Promise<void>;
}

interface RowActionMenuProps {
  readonly label?: string;
  readonly items: readonly RowActionMenuItem[];
}

export function RowActionMenu({ label = "Actions", items }: Readonly<RowActionMenuProps>) {
  return (
    <Menu withinPortal position="bottom-end" shadow="md">
      <Menu.Target>
        <Button variant="light" size="xs" radius="xl" rightSection={<IconChevronDown size={14} />}>
          {label}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {items.map((item) => (
          <Menu.Item
            key={item.label}
            color={item.color}
            leftSection={item.leftSection}
            disabled={item.disabled}
            onClick={() => {
              void item.onClick();
            }}
          >
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
