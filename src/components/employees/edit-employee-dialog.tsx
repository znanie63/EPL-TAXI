import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Calendar, FileText, Briefcase, Building2, FileSignature } from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import { useOrganizations } from "@/hooks/use-organizations";
import { Timestamp } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Employee } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditEmployeeDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEmployeeDialog({ 
  employee,
  open, 
  onOpenChange 
}: EditEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const { updateEmployee } = useEmployees();
  const { organizations = [] } = useOrganizations();
  
  const [formData, setFormData] = useState({
    name: employee.name,
    type: employee.type || "med",
    description: employee.description || "",
    valid_from_date: employee.valid_from_date ? new Date(employee.valid_from_date.seconds * 1000).toISOString().split('T')[0] : "",
    valid_to_date: employee.valid_to_date ? new Date(employee.valid_to_date.seconds * 1000).toISOString().split('T')[0] : "",
    organization_id: employee.organization_ref?.id || "",
    signature: employee.signature || "",
  });

  // Update form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        type: employee.type || "med",
        description: employee.description || "",
        valid_from_date: employee.valid_from_date ? 
          new Date(employee.valid_from_date.seconds * 1000).toISOString().split('T')[0] : "",
        valid_to_date: employee.valid_to_date ? 
          new Date(employee.valid_to_date.seconds * 1000).toISOString().split('T')[0] : "",
        organization_id: employee.organization_ref?.id || "",
        signature: employee.signature || "",
      });
    }
  }, [employee]);

  // Filter organizations based on existing employees
  const availableOrganizations = organizations.filter(org => {
    // Allow current organization
    if (org.id === employee.organization_ref?.id) return true;
    
    // If editing a medic, check if org already has one
    if (formData.type === "med" && !org.med_ref) {
      return true;
    }
    
    // If editing a technician, check if org already has one
    if (formData.type === "teh" && !org.teh_ref) {
      return true;
    }
    
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateEmployee(employee.id, {
        ...formData,
        position: formData.type === "med" ? "Медоператор" : "Механик",
        organization_ref: formData.organization_id ? doc(db, 'organizations', formData.organization_id) : null,
        valid_from_date: Timestamp.fromDate(new Date(formData.valid_from_date + 'T00:00:00')),
        valid_to_date: Timestamp.fromDate(new Date(formData.valid_to_date + 'T00:00:00')),
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update employee:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать сотрудника</DialogTitle>
        </DialogHeader>
        <form id="employee-form" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Тип сотрудника
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="med">Медик</SelectItem>
                      <SelectItem value="teh">Техник</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> ФИО
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Лицензия
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="h-20"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Электронная подпись
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valid_from_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Действует с
                    </Label>
                    <Input
                      id="valid_from_date"
                      type="date"
                      value={formData.valid_from_date}
                      onChange={(e) =>
                        setFormData({ ...formData, valid_from_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valid_to_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Действует по
                    </Label>
                    <Input
                      id="valid_to_date"
                      type="date"
                      value={formData.valid_to_date}
                      onChange={(e) =>
                        setFormData({ ...formData, valid_to_date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signature" className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4" /> Электронная подпись
                  </Label>
                  <Input
                    id="signature"
                    value={formData.signature}
                    onChange={(e) =>
                      setFormData({ ...formData, signature: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Организация
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="organization" className="flex items-center gap-2">
                    Выберите организацию
                  </Label>
                  <Select
                    value={formData.organization_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, organization_id: value })
                    }
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
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}