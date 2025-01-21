import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDrivers } from "@/hooks/use-drivers";
import { useOrganizations } from "@/hooks/use-organizations";
import { AlertTriangle } from "lucide-react";

interface DeleteDriverDialogProps {
  driverId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDriverDialog({ 
  driverId, 
  open, 
  onOpenChange 
}: DeleteDriverDialogProps) {
  const [loading, setLoading] = useState(false);
  const { drivers, deleteDriver } = useDrivers();
  const { organizations } = useOrganizations();
  
  const driver = drivers.find(d => d.id === driverId);
  const organization = organizations.find(org => 
    org.id === driver?.organizationRef?.id
  );

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDriver(driverId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete driver:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!driver) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            Удаление водителя
          </AlertDialogTitle>
          <div className="space-y-4 mt-4">
            {organization ? (
              <>
                <AlertDialogDescription className="font-medium text-destructive">
                  Водитель прикреплен к организации "{organization.name}"
                </AlertDialogDescription>
                <AlertDialogDescription>
                  При удалении водителя:
                </AlertDialogDescription>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>Водитель потеряет доступ к системе</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>История ЭПЛ будет недоступна</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span>Восстановление данных будет невозможно</span>
                  </div>
                </div>
                <AlertDialogDescription className="font-medium">
                  Рекомендуется сначала перевести водителя в другую организацию
                </AlertDialogDescription>
              </>
            ) : (
              <AlertDialogDescription>
                Вы уверены, что хотите удалить водителя "{driver.display_name}"?
                Это действие необратимо.
              </AlertDialogDescription>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}