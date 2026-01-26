import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const applyLightTheme = useCallback(() => {
    setTheme("light");
  }, [setTheme]);
  const applyDarkTheme = useCallback(() => {
    setTheme("dark");
  }, [setTheme]);
  const applySystemTheme = useCallback(() => {
    setTheme("system");
  }, [setTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
        <HugeiconsIcon icon={theme === "light" ? Sun03Icon : Moon02Icon} strokeWidth={2} />
        <span className="sr-only">Toggle Theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={applyLightTheme}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={applyDarkTheme}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={applySystemTheme}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
