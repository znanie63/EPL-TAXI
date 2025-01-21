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
import { useEmployees } from "@/hooks/use-employees";
import { useOrganizations } from "@/hooks/use-organizations";
import { AlertTriangle } from "lucide-react";

interface DeleteEmployeeDialogProps {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEmployeeDialog({ employeeId, open, onOpenChange }: DeleteEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const { employees, deleteEmployee } = useEmployees();
  const { organizations } = useOrganizations();
  
  const employee = employees.find(e => e.id === employeeId);
  const organization = organizations.find(org => 
    org.id === employee?.organization_ref?.id
  );

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteEmployee(employeeId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete employee:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            Удаление сотрудника
          </AlertDialogTitle>
          <div className="space-y-3 text-muted-foreground">
            {organization ? (
              <>
                <div>
                  Сотрудник прикреплен к организации "{organization.name}". 
                  Водители не смогут выпускать ЭПЛ без {employee.type === "med" ? "медика" : "техника"}.
                </div>
                <div className="font-medium">
                  Перед удалением замените этого сотрудника на другого, чтобы водители могли выпускать ЭПЛ без ошибок.
                </div>
              </>
            ) : (
              <div>Вы уверены, что хотите удалить этого сотрудника?</div>
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