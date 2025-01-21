import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { 
  Plus, 
  User, 
  Calendar, 
  FileText, 
  Briefcase, 
  Building2, 
  FileSignature 
} from "lucide-react";
import { useEmployees } from "@/hooks/use-employees";
import { useProfile } from "@/hooks/use-profile";
import { useOrganizations } from "@/hooks/use-organizations";
import { Timestamp } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function AddEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addEmployee } = useEmployees();
  const { profile } = useProfile();
  const { organizations } = useOrganizations();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const Wrapper = isDesktop ? Dialog : Drawer;
  const WrapperContent = isDesktop ? DialogContent : DrawerContent;
  const WrapperHeader = isDesktop ? DialogHeader : DrawerHeader;
  const WrapperTitle = isDesktop ? DialogTitle : DrawerTitle;
  const WrapperTrigger = isDesktop ? DialogTrigger : DrawerTrigger;
  
  const [formData, setFormData] = useState({
    name: "",
    type: "med",
    description: "",
    valid_from_date: "",
    valid_to_date: "",
    organization_id: "",
    signature: "",
  });

  // Filter organizations based on existing employees
  const availableOrganizations = organizations.filter(org => {
    // If adding a medic, check if org already has one
    if (formData.type === "med" && !org.med_ref) {
      return true;
    }
    
    // If adding a technician, check if org already has one
    if (formData.type === "teh" && !org.teh_ref) {
      return true;
    }
    
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    
    try {
      const now = Timestamp.now();
      await addEmployee({
        ...formData,
        position: formData.type === "med" ? "Медоператор" : "Механик",
        parthner_uid: profile.uid || '',
        organization_ref: doc(db, 'organizations', formData.organization_id),
        created_time: now,
        status: 'active'
      });
      
      setOpen(false);
      setFormData({
        name: "",
        type: "med",
        description: "",
        valid_from_date: "",
        valid_to_date: "",
        organization_id: "",
        signature: "",
      });
    } catch (error) {
      console.error("Failed to add employee:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper open={open} onOpenChange={setOpen}>
      <WrapperTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Добавить сотрудника</span>
          <span className="sm:hidden">Добавить</span>
        </Button>
      </WrapperTrigger>
      <WrapperContent className={cn(
        isDesktop ? "sm:max-w-[500px] max-h-[90vh]" : "h-[85vh] px-0",
        "overflow-hidden flex flex-col"
      )}>
        <WrapperHeader>
          <WrapperTitle className="text-lg">Добавить нового сотрудника</WrapperTitle>
          <Separator className="my-4" />
        </WrapperHeader>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pb-safe">
          <div className={cn(
            "space-y-3",
            !isDesktop && "px-4"
          )}>
            <h3 className="text-lg font-medium">Основная информация</h3>
            <div className="space-y-4">
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-20" 
                />
              </div>
            </div>

            <Separator />

            <h3 className="text-lg font-medium">Электронная подпись</h3>
            <div className="space-y-4">
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
            </div>

            <Separator />

            <h3 className="text-lg font-medium">Организация</h3>
            <div className="space-y-2">
              <Label htmlFor="organization" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Организация
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
          </div>

          <div className={cn(
            "flex justify-end gap-4 mt-4 mb-4",
            !isDesktop && "px-4"
          )}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? "Добавление..." : "Добавить"}
            </Button>
          </div>
        </form>
      </WrapperContent>
    </Wrapper>
  );
}