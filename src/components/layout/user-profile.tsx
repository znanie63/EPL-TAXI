import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, ChevronRight, Mail, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserProfileProps {
  collapsed: boolean;
  onNavigate: () => void;
}

const getRoleText = (role?: string) => {
  switch (role) {
    case "Super":
      return "Супер админ";
    case "Driver":
      return "Водитель";
    case "Parthner":
      return "Партнер";
    default:
      return "Пользователь";
  }
};

export function UserProfile({ collapsed, onNavigate }: UserProfileProps) {
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2",
        collapsed && "justify-center"
      )}>
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            <UserCircle className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={onNavigate} 
      className="w-full group rounded-lg hover:bg-muted/50 transition-colors p-2"
    >
      <div className={cn("flex items-center gap-3",
        collapsed ? "justify-center" : "flex-1"
      )}>
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={profile.photo_url} alt={profile.display_name} />
          <AvatarFallback>
            <UserCircle className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex flex-col min-w-0 text-left flex-1 gap-1">
            <div className="font-medium truncate">
              {profile.display_name}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {getRoleText(profile.role)}
            </div>
          </div>
        )}
        {!collapsed && (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5 opacity-0 group-hover:opacity-100" />
        )}
      </div>
    </Button>
  );
}