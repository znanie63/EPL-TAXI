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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User, Mail, Lock, Phone, MessageSquareMore, CreditCard, MessageCircle, StickyNote } from "lucide-react";
import { usePartners } from "@/hooks/use-partners";

export function AddPartnerDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addPartner } = usePartners();
  
  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    password: "",
    phone_number: "",
    phone_help: "",
    epl_price: 100,
    note: "",
    tg_link: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addPartner({
        ...formData,
        role: "Parthner",
        driver_parthner_uid: "null",
        parthners_uid: ["null"],
      });
      
      setOpen(false);
      setFormData({
        display_name: "",
        email: "",
        password: "",
        phone_number: "",
        phone_help: "",
        epl_price: 100,
        note: "",
        tg_link: "",
      });
    } catch (error) {
      console.error("Failed to add partner:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить партнера
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить нового партнера</DialogTitle>
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

            {/* Authentication Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Данные для входа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Пароль
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Добавление..." : "Добавить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}