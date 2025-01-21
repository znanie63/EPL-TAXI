import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  title: string;
  icon: LucideIcon;
  href: string;
  isActive?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export function NavLink({ title, icon: Icon, href, isActive, collapsed, onClick }: NavLinkProps) {
  return (
    <Button
      variant="ghost"
      className={cn("w-full h-9 p-2", {
        "justify-center": collapsed,
        "justify-start": !collapsed,
        "bg-muted": isActive
      })}
      onClick={onClick}
    >
      <Icon className={cn("h-4 w-4", {
        "mr-2": !collapsed
      })} />
      {!collapsed && title}
    </Button>
  );
}