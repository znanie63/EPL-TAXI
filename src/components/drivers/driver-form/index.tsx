/**
 * Main driver form component that handles both creation and editing of drivers
 * Uses a drawer on mobile and dialog on desktop
 */
import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { DriverFormContent } from "./driver-form-content";
import type { User } from "@/lib/types";
import { generateMockDriverData } from "@/lib/utils/mock-data";

interface DriverFormProps {
  driver?: User;
  mode: 'create' | 'edit';
  onSubmit: (data: Partial<User>) => Promise<void>;
  trigger?: React.ReactNode;
}

export function DriverForm({ 
  driver, 
  mode,
  onSubmit,
  trigger 
}: DriverFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Partial<User> | undefined>();
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const Wrapper = isDesktop ? Dialog : Drawer;
  const WrapperContent = isDesktop ? DialogContent : DrawerContent;
  const WrapperHeader = isDesktop ? DialogHeader : DrawerHeader;
  const WrapperTitle = isDesktop ? DialogTitle : DrawerTitle;
  const WrapperTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  const handleSubmit = async (data: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(data);
      setOpen(false);
      setError(null);
    } catch (error) {
      console.error('Failed to submit driver:', error);
      
      // Handle specific error cases
      if (error?.code === 'already-exists') {
        setError(error.originalError?.message || 'Водитель с таким email уже существует');
      } else if (error?.code === 'auth/invalid-email') {
        setError('Неверный формат email');
      } else if (error?.code === 'invalid-argument') {
        setError(error.message || 'Неверные данные');
      } else {
        setError(error.originalError?.message || 'Не удалось создать водителя');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <Wrapper 
      open={open} 
      onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setInitialData(undefined);
      }
      }}
    >
      <WrapperTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Добавить водителя</span>
            <span className="sm:hidden">Добавить</span>
          </Button>
        )}
      </WrapperTrigger>
      <WrapperContent className={cn(
        isDesktop ? "sm:max-w-[500px] max-h-[90vh]" : "h-[85vh] px-0",
        "overflow-hidden flex flex-col"
      )}>
        <WrapperHeader>
          <WrapperTitle className="text-lg">
            {mode === 'create' ? 'Добавить водителя' : 'Редактировать водителя'}
          </WrapperTitle>
          {error && (
            <div className="mt-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <Separator className="my-4" />
        </WrapperHeader>
        <DriverFormContent
          driver={driver}
          initialData={initialData}
          mode={mode}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => setOpen(false)}
          className={!isDesktop && "px-4"}
        />
      </WrapperContent>
    </Wrapper>
  );
}