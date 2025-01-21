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
import { Building2, Phone, Hash, FileSpreadsheet } from "lucide-react";
import { useOrganizations } from "@/hooks/use-organizations";
import type { Organization } from "@/lib/types";

interface EditOrganizationDialogProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOrganizationDialog({ 
  organization,
  open, 
  onOpenChange 
}: EditOrganizationDialogProps) {
  const [loading, setLoading] = useState(false);
  const { updateOrganization, setOrganizations } = useOrganizations();
  
  const [formData, setFormData] = useState({
    name: organization.name,
    address: organization.address,
    phone: organization.phone,
    inn: organization.inn,
    ogrn: organization.ogrn,
    travelSheetForm: organization.travelSheetForm || "",
  });

  // Update form data when organization changes
  useEffect(() => {
    setFormData({
      name: organization.name,
      address: organization.address,
      phone: organization.phone,
      inn: organization.inn,
      ogrn: organization.ogrn,
      travelSheetForm: organization.travelSheetForm || "",
    });
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update organization locally first
      setOrganizations(prev => prev.map(org => 
        org.id === organization.id ? { ...org, ...formData } : org
      ));

      // Then update in the database
      await updateOrganization(organization.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update organization:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать организацию</DialogTitle>
          <Separator className="my-4" />
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Название
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
              <Label htmlFor="address" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Адрес
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Телефон
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inn" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" /> ИНН
                </Label>
                <Input
                  id="inn"
                  value={formData.inn}
                  onChange={(e) =>
                    setFormData({ ...formData, inn: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ogrn" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" /> ОГРН
                </Label>
                <Input
                  id="ogrn"
                  value={formData.ogrn}
                  onChange={(e) =>
                    setFormData({ ...formData, ogrn: e.target.value })
                  }
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="travelSheetForm" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" /> Форма путевого листа
                </Label>
                <Input
                  id="travelSheetForm"
                  value={formData.travelSheetForm}
                  onChange={(e) =>
                    setFormData({ ...formData, travelSheetForm: e.target.value })
                  }
                  placeholder="390 от 29.11.2022."
                  required
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end gap-4 pt-4">
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