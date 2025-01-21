import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MessageSquareMore, CreditCard, MessageCircle, StickyNote } from "lucide-react";
import { usePartners } from "@/hooks/use-partners";
import type { User as UserType } from "@/lib/types";

interface EditPartnerDialogProps {
  partner: UserType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPartnerDialog({ 
  partner,
  open, 
  onOpenChange 
}: EditPartnerDialogProps) {
  const [loading, setLoading] = useState(false);
  const { updatePartner } = usePartners();
  
  const [formData, setFormData] = useState({
    display_name: partner.display_name,
    phone_number: partner.phone_number || "",
    phone_help: partner.phone_help || "",
    epl_price: partner.epl_price || 100,
    note: partner.note || "",
    tg_link: partner.tg_link || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updatePartner(partner.id, {
        ...formData,
        epl_price: Number(formData.epl_price)
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update partner:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать партнера</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">ФИО</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Контактная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Телефон</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({ ...formData, phone_number: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone_help">Телефон поддержки</Label>
                    <Input
                      id="phone_help"
                      value={formData.phone_help}
                      onChange={(e) =>
                        setFormData({ ...formData, phone_help: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tg_link">Телеграм</Label>
                  <Input
                    id="tg_link"
                    value={formData.tg_link}
                    onChange={(e) =>
                      setFormData({ ...formData, tg_link: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Дополнительная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="epl_price">Цена ЭПЛ</Label>
                  <Input
                    id="epl_price"
                    type="number"
                    value={formData.epl_price}
                    onChange={(e) =>
                      setFormData({ ...formData, epl_price: Number(e.target.value) })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="note">Заметки</Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    className="h-20"
                  />
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