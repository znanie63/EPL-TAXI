import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { UserProfile } from "./user-profile";
import { ThemeToggle } from "./theme-toggle";
import { NavLink } from "./nav-link";
import {
  Building2,
  Users,
  Car,
  FileBarChart,
  Save,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const commonNavItems = [
  {
    title: "Основное",
    items: [{
      title: "Организации",
      icon: Building2,
      href: "/organizations"
    },
    {
      title: "Водители",
      icon: Car,
      href: "/drivers"
    },
    {
      title: "Сотрудники",
      icon: Users,
      href: "/employees"
    }]
  }
];

const reportNavItems = [
  {
    title: "Отчеты",
    items: [{
      title: "Отчеты по ЭПЛ",
      icon: FileBarChart,
      href: "/reports",
    },
    {
      title: "Сохраненные шаблоны",
      icon: Save,
      href: "/saved-reports",
    }]
  }
];

const superNavItems = [
  {
    title: "Управление",
    items: [{
      title: "Партнеры",
      icon: Users,
      href: "/partners",
      superOnly: true
    },
    {
      title: "Отчет по партнерам",
      icon: FileBarChart,
      href: "/partner-reports",
      superOnly: true
    }]
  }
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed: boolean;
  onCollapse: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ 
  collapsed, 
  onCollapse, 
  currentPage, 
  onNavigate 
}: SidebarProps) {
  const { logout } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const isSuper = profile?.role === 'Super';

  const handleNavigate = (page: string) => {
    const path = page.startsWith('/') ? page.slice(1) : page;
    onNavigate(path);
    navigate(page);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && <h2 className="text-lg font-semibold">Панель управления</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className={cn("h-8 w-8 shrink-0", collapsed && "mx-auto")}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-2">
          {commonNavItems.map((section) => (
            <div key={section.title} className="space-y-0.5">
              {!collapsed && (
                <h4 className="text-xs font-semibold text-muted-foreground px-3 pt-4">
                  {section.title}
                </h4>
              )}
              <div className="px-2 space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    title={item.title}
                    icon={item.icon}
                    href={item.href}
                    collapsed={collapsed}
                    isActive={currentPage === (item.href.startsWith('/') ? item.href.slice(1) : item.href)}
                    onClick={() => handleNavigate(item.href)}
                  />
                ))}
              </div>
            </div>
          ))}
          
          <Separator className="my-2" />
          
          {reportNavItems.map((section) => (
            <div key={section.title} className="space-y-0.5">
              {!collapsed && (
                <h4 className="text-xs font-semibold text-muted-foreground px-3 pt-4">
                  {section.title}
                </h4>
              )}
              <div className="px-2 space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    title={item.title}
                    icon={item.icon}
                    href={item.href}
                    collapsed={collapsed}
                    isActive={currentPage === (item.href.startsWith('/') ? item.href.slice(1) : item.href)}
                    onClick={() => handleNavigate(item.href)}
                  />
                ))}
              </div>
            </div>
          ))}
          
          {isSuper && (
            <>
              <Separator className="my-2" />
              {superNavItems.map((section) => (
                <div key={section.title} className="space-y-0.5">
                  {!collapsed && (
                    <h4 className="text-xs font-semibold text-muted-foreground px-3 pt-4">
                      {section.title}
                    </h4>
                  )}
                  <div className="px-2 space-y-0.5">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.href}
                        title={item.title}
                        icon={item.icon}
                        href={item.href}
                        collapsed={collapsed}
                        isActive={currentPage === (item.href.startsWith('/') ? item.href.slice(1) : item.href)}
                        onClick={() => handleNavigate(item.href)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </nav>
      </ScrollArea>

      <div className="mt-auto">
        <div className="px-2 py-2 border-t">
          <UserProfile collapsed={collapsed} onNavigate={() => handleNavigate("/profile")} />
        </div>
        <div className="p-2 border-t">
          <div className="mb-1">
            <ThemeToggle collapsed={collapsed} />
          </div>
          <Button
            variant="ghost"
            className={cn(
              "w-full h-9 p-2",
              collapsed ? "justify-center" : "justify-start",
              "hover:bg-destructive/10 hover:text-destructive"
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Выход"}
          </Button>
        </div>
      </div>
    </div>
  );
}