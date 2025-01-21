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
import { Plus, CreditCard, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDrivers } from "@/hooks/use-drivers";
import { useProfile } from "@/hooks/use-profile";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";

interface TopUpBalanceDialogProps {
  driverId: string;
  trigger?: React.ReactNode;
}

const paymentTypes = [
  { value: 'cash', label: 'Наличными', icon: Wallet },
  { value: 'card', label: 'Картой', icon: CreditCard },
];

export function TopUpBalanceDialog({ driverId, trigger }: TopUpBalanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [comment, setComment] = useState("");
  const { drivers } = useDrivers();
  const { toast } = useToast();
  const { profile } = useProfile();
  
  // Only show for super admins
  if (profile?.role !== 'Super') {
    return null;
  }
  
  const driver = drivers.find(d => d.id === driverId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver || profile?.role !== 'Super') return;
    
    setLoading(true);
    try {
      const numAmount = parseInt(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        toast({
          title: "Ошибка",
          description: "Введите корректную сумму пополнения",
          variant: "destructive",
        });
        throw new Error('Invalid amount');
      }
      
      // Update driver balance
      const driverRef = doc(db, 'users', driverId);
      await updateDoc(driverRef, {
        balance: (driver.balance || 0) + numAmount
      });
      
      // Add balance history record
      await addDoc(collection(db, 'balance_history'), {
        driver_id: driverId,
        amount: numAmount,
        type: 'topup',
        payment_type: paymentType,
        created_time: Timestamp.now(),
        description: comment || 'Пополнение баланса'
      });
      
      setOpen(false);
      setAmount("");
      setPaymentType("cash");
      setComment("");
      
      toast({
        title: "Баланс пополнен",
        description: `Баланс успешно пополнен на ${numAmount.toLocaleString('ru-RU')} ₽`,
      });
    } catch (error) {
      console.error('Failed to top up balance:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось пополнить баланс",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Пополнить баланс
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Пополнение баланса</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Способ оплаты</Label>
            <Select
              value={paymentType}
              onValueChange={setPaymentType}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentTypes.map(type => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Сумма пополнения</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Пополнение..." : "Пополнить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}