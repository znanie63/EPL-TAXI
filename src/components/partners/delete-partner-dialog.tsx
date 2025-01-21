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
import { usePartners } from "@/hooks/use-partners";
import { useDrivers } from "@/hooks/use-drivers";
import { AlertTriangle } from "lucide-react";

interface DeletePartnerDialogProps {
  partnerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePartnerDialog({ 
  partnerId, 
  open, 
  onOpenChange 
}: DeletePartnerDialogProps) {
  const [loading, setLoading] = useState(false);
  const { partners, deletePartner } = usePartners();
  const { drivers } = useDrivers();
  
  const partner = partners.find(p => p.id === partnerId);
  const partnerDrivers = drivers.filter(d => d.driver_parthner_uid === partner?.uid);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletePartner(partnerId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete partner:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!partner) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            Удаление партнера
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {partnerDrivers.length > 0 ? (
              <>
                <span className="block font-medium text-destructive">
                  У партнера есть {partnerDrivers.length} активных водителей
                </span>
                <div className="space-y-2">
                  <span className="block">При удалении партнера:</span>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    <li>Все водители будут удалены из системы</li>
                    <li>История ЭПЛ будет недоступна</li>
                    <li>Восстановление данных будет невозможно</li>
                  </ul>
                </div>
                <span className="block font-medium">
                  Рекомендуется сначала перевести водителей к другому партнеру
                </span>
              </>
            ) : (
              <span className="block">
                Вы уверены, что хотите удалить партнера "{partner.display_name}"?
                Это действие необратимо.
              </span>
            )}
          </AlertDialogDescription>
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