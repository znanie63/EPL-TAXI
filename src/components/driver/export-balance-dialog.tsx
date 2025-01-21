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
import { FileDown, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ExportBalanceDialogProps {
  history: any[];
}

export function ExportBalanceDialog({ history }: ExportBalanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleExport = () => {
    // Filter records by date if dates are selected
    let filteredHistory = [...history];
    if (dateFrom || dateTo) {
      filteredHistory = history.filter(record => {
        const recordDate = record.created_time.toDate();
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;

        if (fromDate && recordDate < fromDate) return false;
        if (toDate && recordDate > toDate) return false;
        return true;
      });
    }

    // Prepare CSV content
    const headers = ["Дата", "Тип", "Способ оплаты", "Описание", "Сумма"];
    const rows = filteredHistory.map(record => [
      format(record.created_time.toDate(), "dd.MM.yyyy HH:mm"),
      record.type === 'topup' ? 'Пополнение' : 'Списание',
      record.type === 'topup' ? (record.payment_type === 'cash' ? 'Наличными' : 'Картой') : '',
      record.description || '',
      `${record.type === 'topup' ? '+' : '-'}${Math.abs(record.amount)}`
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? 
          `"${cell.replace(/"/g, '""')}"` : 
          cell
      ).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `balance-history${dateFrom ? `-from-${dateFrom}` : ''}${dateTo ? `-to-${dateTo}` : ''}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown className="h-4 w-4" />
          Экспорт
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Экспорт истории баланса</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Начало периода
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Конец периода
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleExport}>
              Экспортировать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}