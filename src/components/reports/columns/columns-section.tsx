import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { availableColumns } from "./available-columns";

interface ColumnsSectionProps {
  selectedColumns: string[];
  showTotals: boolean;
  onColumnsChange: (columns: string[]) => void;
  onShowTotalsChange: (show: boolean) => void;
}

export function ColumnsSection({
  selectedColumns,
  showTotals,
  onColumnsChange,
  onShowTotalsChange
}: ColumnsSectionProps) {
  const toggleColumn = (columnId: string) => {
    // Don't allow toggling required columns
    if (availableColumns.find(col => col.id === columnId)?.required) {
      return;
    }

    if (selectedColumns.includes(columnId)) {
      onColumnsChange(selectedColumns.filter(id => id !== columnId));
    } else {
      onColumnsChange([...selectedColumns, columnId]);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="show-totals" className="text-sm">
          Показывать итоги
        </Label>
        <Switch
          id="show-totals"
          checked={showTotals}
          onCheckedChange={onShowTotalsChange}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {availableColumns.map((column) => (
          <Badge
            key={column.id}
            variant={selectedColumns.includes(column.id) ? "default" : "outline"} 
            className={cn(
              "cursor-pointer",
              column.required && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => toggleColumn(column.id)}
          >
            {column.label}
            {column.required && <span className="ml-1 text-xs">*</span>}
          </Badge>
        ))}
      </div>
    </div>
  );
}