import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
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
import { Plus, Building2, Phone, Hash, FileSpreadsheet } from "lucide-react";
import { useOrganizations } from "@/hooks/use-organizations";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query"; 
import { Timestamp } from "firebase/firestore";

export function AddOrganizationDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { organizations, addOrganization, setOrganizations } = useOrganizations();
  const { profile } = useProfile();
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    inn: "",
    ogrn: "",
    travelSheetForm: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    
    try {
      const now = Timestamp.now();
      const id = await addOrganization({
        ...formData,
        parthner_uid: profile.uid,
        created_time: now,
        status: 'active'
      });
      
      // Update local state with new organization
      const newOrganization = {
        id,
        ...formData,
        parthner_uid: profile.uid,
        created_time: now,
        status: 'active' as const,
        driversRefs: [],
        employeesRefs: [],
      };
      
      setOrganizations([...organizations, newOrganization]);
      
      setOpen(false);
      setFormData({
        name: "",
        address: "",
        phone: "",
        inn: "",
        ogrn: "",
        travelSheetForm: "",
      });
    } catch (error) {
      console.error("Failed to add organization:", error);
    } finally {
      setLoading(false);
    }
  };
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const Wrapper = isDesktop ? Dialog : Drawer;
  const WrapperContent = isDesktop ? DialogContent : DrawerContent;
  const WrapperHeader = isDesktop ? DialogHeader : DrawerHeader;
  const WrapperTitle = isDesktop ? DialogTitle : DrawerTitle;
  const WrapperTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  return (
    <Wrapper open={open} onOpenChange={setOpen}>
      <WrapperTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Добавить организацию</span>
          <span className="sm:hidden">Добавить</span>
        </Button>
      </WrapperTrigger>
      <WrapperContent className={cn(
        isDesktop ? "sm:max-w-[500px]" : "h-[85vh] px-0",
        "overflow-hidden flex flex-col"
      )}>
        <WrapperHeader>
          <WrapperTitle className="text-lg">Добавить новую организацию</WrapperTitle>
          <Separator className="my-4" />
        </WrapperHeader>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pb-safe">
          <div className={cn(
            "grid gap-4",
            !isDesktop && "px-4"
          )}> 
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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