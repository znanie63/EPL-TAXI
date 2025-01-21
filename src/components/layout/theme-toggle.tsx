import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeToggleProps {
  collapsed?: boolean;
}

const themes = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "dark", label: "Темная", icon: Moon },
  { value: "system", label: "Системная", icon: Monitor },
] as const;

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const currentTheme = themes.find((t) => t.value === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "group",
            collapsed ? "h-9 w-9 p-0" : "w-full justify-start"
          )}
        >
          <Icon className={cn(
            "h-4 w-4 transition-all",
            !collapsed && "mr-2",
            "group-hover:text-primary"
          )} />
          {!collapsed && (
            <span className="transition-colors group-hover:text-primary">
              {currentTheme.label} тема
            </span>
          )}
          <span className="sr-only">Выбрать тему оформления</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {themes.map(({ value, label, icon: ThemeIcon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              theme === value && "bg-muted"
            )}
          >
            <ThemeIcon className="h-4 w-4" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}