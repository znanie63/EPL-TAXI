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
import { useOrganizations } from "@/hooks/use-organizations";
import { useEmployees } from "@/hooks/use-employees";
import { useDrivers } from "@/hooks/use-drivers";
import { AlertTriangle } from "lucide-react";

interface DeleteOrganizationDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteOrganizationDialog({ 
  organizationId, 
  open, 
  onOpenChange 
}: DeleteOrganizationDialogProps) {
  const [loading, setLoading] = useState(false);
  const { organizations, deleteOrganization, setOrganizations } = useOrganizations();
  const { employees } = useEmployees();
  const { drivers } = useDrivers();
  
  const organization = organizations.find(org => org.id === organizationId);
  
  // Check for assigned drivers and employees
  const assignedDrivers = drivers.filter(driver => 
    driver.organizationRef?.id === organizationId
  );
  
  const assignedEmployees = employees.filter(emp => 
    emp.organization_ref?.id === organizationId
  );
  
  const hasMedic = assignedEmployees.some(emp => emp.type === "med");
  const hasTechnician = assignedEmployees.some(emp => emp.type === "teh");
  const hasAssignedEmployees = hasMedic || hasTechnician;

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Update local state first
      setOrganizations(organizations.filter(org => org.id !== organizationId));
      
      // Then update in the database
      await deleteOrganization(organizationId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete organization:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!organization) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            Удаление организации
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {assignedDrivers.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-destructive">
                  В организации закреплено {assignedDrivers.length} водителей
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Водители потеряют доступ к системе</li>
                  <li>• Не смогут выпускать новые ЭПЛ</li>
                  <li>• Необходимо перевести водителей в другую организацию</li>
                </ul>
              </div>
            )}
            
            {hasAssignedEmployees && (
              <div className="space-y-2">
                <p className="font-medium text-destructive">
                  В организации закреплены сотрудники
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {hasMedic && <li>• Медработник будет откреплен</li>}
                  {hasTechnician && <li>• Техник будет откреплен</li>}
                </ul>
              </div>
            )}
            
            {!assignedDrivers.length && !hasAssignedEmployees && (
              <p>Вы уверены, что хотите удалить организацию "{organization.name}"?</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || assignedDrivers.length > 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}