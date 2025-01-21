import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { UserProfile } from "./user-profile";
import { ThemeToggle } from "./theme-toggle";
import {
  Building2,
  Users,
  Car,
  FileBarChart,
  Save,
  Menu,
  LogOut
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

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuper = profile?.role === 'Super';

  const getPageTitle = () => {
    const allItems = [
      ...commonNavItems.flatMap(section => section.items),
      ...reportNavItems.flatMap(section => section.items),
      ...(isSuper ? superNavItems.flatMap(section => section.items) : [])
    ];
    
    const currentItem = allItems.find(item => item.href === location.pathname);
    return currentItem?.title || 'Панель управления';
  };

  const handleNavigate = (page: string) => {
    const path = page.startsWith('/') ? page.slice(1) : page;
    onNavigate(path);
    navigate(page);
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden z-50 w-full">
      <div className="flex items-center p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-4">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Навигационное меню</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Меню</h2>
              </div>
              
              <div className="px-2 py-2 border-b">
                <UserProfile collapsed={false} onNavigate={() => handleNavigate("/profile")} />
              </div>
              
              <ScrollArea className="flex-1">
                <nav className="space-y-2">
                  {commonNavItems.map((section) => (
                    <div key={section.title} className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-muted-foreground px-3 pt-4">
                        {section.title}
                      </h4>
                      <div className="space-y-0.5 px-2">
                        {section.items.map((item) => (
                          <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start",
                              location.pathname === item.href && "bg-muted"
                            )}
                            onClick={() => handleNavigate(item.href)}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  {reportNavItems.map((section) => (
                    <div key={section.title} className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-muted-foreground px-3 pt-4">
                        {section.title}
                      </h4>
                      <div className="space-y-0.5 px-2">
                        {section.items.map((item) => (
                          <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start",
                              location.pathname === item.href && "bg-muted"
                            )}
                            onClick={() => handleNavigate(item.href)}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {isSuper && (
                    <>
                      <Separator />
                      {superNavItems.map((section) => (
                        <div key={section.title} className="space-y-0.5">
                          <h4 className="text-xs font-semibold text-muted-foreground px-3 pt-4">
                            {section.title}
                          </h4>
                          <div className="space-y-0.5 px-2">
                            {section.items.map((item) => (
                              <Button
                                key={item.href}
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start",
                                  location.pathname === item.href && "bg-muted"
                                )}
                                onClick={() => handleNavigate(item.href)}
                              >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.title}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </nav>
              </ScrollArea>
              
              <div className="border-t p-2">
                <div className="mb-4">
                  <ThemeToggle collapsed={false} />
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Выход
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
      </div>
    </div>
  );
}