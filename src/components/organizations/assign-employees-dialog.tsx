import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployees } from "@/hooks/use-employees";
import { useOrganizations } from "@/hooks/use-organizations";
import { doc, DocumentReference } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, UserCheck } from "lucide-react";

interface AssignEmployeesDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignEmployeesDialog({ 
  organizationId, 
  open, 
  onOpenChange 
}: AssignEmployeesDialogProps) {
  const [loading, setLoading] = useState(false);
  const { employees, updateEmployee, setEmployees } = useEmployees();
  const { organizations, updateOrganization } = useOrganizations();
  const { toast } = useToast();
  
  const organization = organizations.find(org => org.id === organizationId);
  
  // Get currently assigned employees
  const assignedMedic = employees.find(emp => 
    emp.type === "med" && emp.organization_ref?.id === organizationId
  );
  
  const assignedTechnician = employees.find(emp => 
    emp.type === "teh" && emp.organization_ref?.id === organizationId
  );
  
  // Filter available employees
  const availableMedics = employees.filter(emp => 
    emp.type === "med" && !emp.organization_ref
  );
  
  const availableTechnicians = employees.filter(emp => 
    emp.type === "teh" && !emp.organization_ref
  );
  
  const [selectedMedic, setSelectedMedic] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  const handleUnassign = async (employeeId: string, type: "med" | "teh") => {
    setLoading(true);
    try {
      // Update organization first
      const updateData = type === "med" ? 
        { med_ref: null } : 
        { teh_ref: null };
      
      await updateOrganization(organizationId, updateData);

      // Then update employee
      await updateEmployee(employeeId, {
        organization_ref: null
      });
      
      toast({
        title: "Сотрудник откреплен",
        description: "Сотрудник успешно откреплен от организации",
      });
      
      // Reset the corresponding selection state
      if (type === "med") {
        setSelectedMedic("");
      } else {
        setSelectedTechnician("");
      }
    } catch (error) {
      console.error("Failed to unassign employee:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось открепить сотрудника",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMedic = async () => {
    if (!organization) return;
    
    setLoading(true);
    const organizationRef = doc(db, 'organizations', organizationId);
    
    try {
      // Update organization first
      await updateOrganization(organizationId, {
        med_ref: doc(db, 'employees', selectedMedic)
      });

      // Then update employee
      await updateEmployee(selectedMedic, {
        organization_ref: organizationRef,
        organization_id: organizationId
      });
      
      // Reset selection after successful assignment
      setSelectedMedic("");
      
      toast({
        title: "Медработник назначен",
        description: "Медработник успешно прикреплен к организации",
      });
    } catch (error) {
      console.error("Failed to assign medic:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось назначить медработника",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignTechnician = async () => {
    if (!organization) return;
    
    setLoading(true);
    const organizationRef = doc(db, 'organizations', organizationId);
    
    try {
      // Update organization first
      await updateOrganization(organizationId, {
        teh_ref: doc(db, 'employees', selectedTechnician)
      });

      // Then update employee
      await updateEmployee(selectedTechnician, {
        organization_ref: organizationRef,
        organization_id: organizationId
      });
      
      // Reset selection after successful assignment
      setSelectedTechnician("");
      
      toast({
        title: "Техник назначен",
        description: "Техник успешно прикреплен к организации",
      });
    } catch (error) {
      console.error("Failed to assign technician:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось назначить техника",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!organization) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Управление сотрудниками</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-6">
            {/* Medic Section */}
            <div>
              {assignedMedic ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <div className="space-y-1">
                      <div className="font-medium">{assignedMedic.name}</div>
                      <div className="text-sm text-muted-foreground">Медработник</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnassign(assignedMedic.id, "med")}
                    disabled={loading}
                  >
                    Открепить
                  </Button>
                </div>
              ) : availableMedics.length > 0 ? (
                <div className="flex gap-2">
                  <Select
                    value={selectedMedic}
                    onValueChange={setSelectedMedic}
                    className="flex-1"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите медработника" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMedics.map(medic => (
                        <SelectItem key={medic.id} value={medic.id}>
                          {medic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignMedic}
                    disabled={loading || !selectedMedic}
                  >
                    Назначить
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Нет доступных медработников
                </div>
              )}
            </div>

            {/* Technician Section */}
            <div>
              {assignedTechnician ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <div className="space-y-1">
                      <div className="font-medium">{assignedTechnician.name}</div>
                      <div className="text-sm text-muted-foreground">Техник</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnassign(assignedTechnician.id, "teh")}
                    disabled={loading}
                  >
                    Открепить
                  </Button>
                </div>
              ) : availableTechnicians.length > 0 ? (
                <div className="flex gap-2">
                  <Select
                    value={selectedTechnician}
                    onValueChange={setSelectedTechnician}
                    className="flex-1"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите техника" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTechnicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignTechnician}
                    disabled={loading || !selectedTechnician}
                  >
                    Назначить
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Нет доступных техников
                </div>
              )}
            </div>
            
            {(availableMedics.length === 0 && availableTechnicians.length === 0 && !assignedMedic && !assignedTechnician) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Нет доступных сотрудников для назначения</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}