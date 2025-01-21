import { useState } from "react";
import { useLocation } from 'react-router-dom';
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
import { Save } from "lucide-react";
import { useStore } from "@/lib/store";
import { useSavedReports } from "@/hooks/use-saved-reports";

export function SaveReportDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const { saveReport } = useSavedReports();
  const { 
    eplColumns, 
    partnerColumns,
    reportFilters, 
    eplDateRange,
    partnerDateRange,
    eplShowTotals,
    partnerShowTotals 
  } = useStore();
  const location = useLocation();
  const isPartnerReport = location.pathname === '/partner-reports';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await saveReport({
        name,
        type: isPartnerReport ? 'partner' : 'epl',
        columns: isPartnerReport ? partnerColumns : eplColumns,
        filters: reportFilters,
        dateRange: isPartnerReport ? partnerDateRange : eplDateRange,
        showTotals: isPartnerReport ? partnerShowTotals : eplShowTotals,
      });
      setOpen(false);
      setName("");
    } catch (error) {
      console.error('Failed to save report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Сохранить шаблон
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сохранить шаблон</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название шаблона</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название шаблона"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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