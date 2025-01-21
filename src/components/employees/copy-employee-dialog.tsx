import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import { useOrganizations } from "@/hooks/use-organizations";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Employee } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CopyEmployeeDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CopyEmployeeDialog({ 
  employee,
  open, 
  onOpenChange 
}: CopyEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const { addEmployee } = useEmployees();
  const { organizations } = useOrganizations();
  const [organizationId, setOrganizationId] = useState("");

  // Filter organizations based on existing employees
  const availableOrganizations = organizations.filter(org => {
    // Skip current organization
    if (org.id === employee.organization_ref?.id) return false;
    
    const existingEmployees = org.employeesRefs || [];
    if (existingEmployees.length === 0) return true;
    
    // Check based on employee type
    if (employee.type === "med" && !existingEmployees.some(e => e.type === "med")) {
      return true;
    }
    
    if (employee.type === "teh" && !existingEmployees.some(e => e.type === "teh")) {
      return true;
    }
    
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;
    
    setLoading(true);
    try {
      // Create new employee with copied data but new organization
      await addEmployee({
        ...employee,
        organization_ref: doc(db, 'organizations', organizationId),
        organization_id: organizationId,
      });
      
      onOpenChange(false);
      setOrganizationId("");
    } catch (error) {
      console.error("Failed to copy employee:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Копировать сотрудника</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Выберите организацию
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    В какую организацию скопировать сотрудника?
                  </Label>
                  <Select
                    value={organizationId}
                    onValueChange={setOrganizationId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите организацию" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOrganizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  Будет создана копия сотрудника "{employee.name}" с сохранением всех данных,
                  но с привязкой к выбранной организации.
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !organizationId}
            >
              {loading ? "Копирование..." : "Копировать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}