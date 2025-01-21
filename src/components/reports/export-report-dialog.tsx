import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileDown } from "lucide-react";
import { downloadAsCSV } from "@/lib/utils";

interface ExportReportDialogProps {
  data: any[];
  orderedColumns: string[];
}

export function ExportReportDialog({ data, orderedColumns }: ExportReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState("report");

  const handleExport = () => {
    // Convert data to CSV format
    const headers = orderedColumns;
    const rows = data.map(row => 
      orderedColumns.map(header => {
        const value = row[header];
        // Handle special cases and formatting
        if (typeof value === 'number') {
          return value.toLocaleString('ru-RU');
        }
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
    );

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Add BOM for UTF-8
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;
    
    // Create blob with UTF-8 encoding
    const blob = new Blob([csvContentWithBOM], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Экспорт в CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Экспорт отчета в CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Название файла</Label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Введите название файла"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleExport}>
              Экспортировать в CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}